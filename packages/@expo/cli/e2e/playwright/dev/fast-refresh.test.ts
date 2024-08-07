import { test, Page, WebSocket, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

import { clearEnv, restoreEnv } from '../../__tests__/export/export-side-effects';
import { getRouterE2ERoot } from '../../__tests__/utils';
import { ExpoStartCommand } from '../../utils/command-instance';

test.beforeAll(() => clearEnv());
test.afterAll(() => restoreEnv());

const projectRoot = getRouterE2ERoot();
const inputDir = 'fast-refresh';

test.describe(inputDir, () => {
  test.beforeAll(async () => {
    // Could take 45s depending on how fast the bundler resolves
    test.setTimeout(560 * 1000);
  });

  let expo: ExpoStartCommand;

  test.beforeEach(async () => {
    expo = new ExpoStartCommand(projectRoot, {
      NODE_ENV: 'development',
      EXPO_USE_STATIC: 'single',
      E2E_ROUTER_JS_ENGINE: 'hermes',
      E2E_ROUTER_SRC: inputDir,
      E2E_ROUTER_ASYNC: 'development',

      // Ensure CI is disabled otherwise the file watcher won't run.
      CI: '0',
    });
  });

  test.afterEach(async () => {
    await expo.stopAsync();
  });

  const targetDirectory = path.join(projectRoot, '__e2e__/fast-refresh/app');
  const indexFile = path.join(targetDirectory, 'index.tsx');

  const mutateIndexFile = async (mutator: (contents: string) => string) => {
    const indexContents = await fs.promises.readFile(indexFile, 'utf8');
    await fs.promises.writeFile(indexFile, mutator(indexContents), 'utf8');
  };

  test.beforeAll(async () => {
    // Ensure `const ROUTE_VALUE = 'ROUTE_VALUE_1';` -> `const ROUTE_VALUE = 'ROUTE_VALUE';` before starting
    await mutateIndexFile((contents) => {
      return contents.replace(/ROUTE_VALUE_[\d\w]+/g, 'ROUTE_VALUE');
    });
  });

  test.afterAll(async () => {
    // Ensure `const ROUTE_VALUE = 'ROUTE_VALUE_1';` -> `const ROUTE_VALUE = 'ROUTE_VALUE';` before starting
    await mutateIndexFile((contents) => {
      return contents.replace(/ROUTE_VALUE_[\d\w]+/g, 'ROUTE_VALUE');
    });
  });

  test('updates with fast refresh', async ({ page }) => {
    console.time('expo start');
    // expo.addListener('stdout', (chunk) => {
    //   console.log('[CLI]: stdout:', ...chunk);
    // });
    // expo.addListener('stderr', (chunk) => {
    //   console.log('[CLI]: stderr:', ...chunk);
    // });
    await expo.startAsync();
    // page.on('console', (msg) => console.log('[PAGE]:', msg.text()));

    console.timeEnd('expo start');

    console.log('Server running:', expo.url);

    console.time('Eagerly bundled JS');
    const indexRes = await expo.fetchAsync('/');
    expect(indexRes.ok).toBe(true);
    await indexRes.text();
    console.timeEnd('Eagerly bundled JS');

    console.time('Open page');

    const allSockets: WebSocket[] = [];

    page.on('websocket', (ws) => {
      allSockets.push(ws);
    });

    function waitForSocket(page: Page, matcher: (ws: WebSocket) => boolean) {
      return new Promise<WebSocket>((res) => {
        for (const ws of allSockets) {
          if (matcher(ws)) {
            res(ws);
            return;
          }
        }

        page.on('websocket', (ws) => {
          console.log('Socket connected:', ws.url());
          if (matcher(ws)) {
            res(ws);
          }
        });
      });
    }

    // Navigate to the app
    await page.goto(expo.url);

    console.timeEnd('Open page');

    // Ensure the message socket connects (not related to HMR).

    console.log('Waiting for /hot socket');

    // NOTE: Start this test before navigating to the page to ensure we don't miss any events.
    // Ensure the hot socket connects
    const [hotSocket] = await Promise.all([
      raceOrFail(
        waitForSocket(page, (ws) => ws.url().endsWith('/hot')),
        // Should be really fast
        500,
        'HMR websocket on client took too long to connect.'
      ),
      // Order matters, message socket is set first.
      raceOrFail(
        waitForSocket(page, (ws) => ws.url().endsWith('/message')),
        500,
        'Message socket on client took too long to connect.'
      ),
    ]);

    console.log('Found /hot socket');

    // Ensure the entry point is registered
    await hotSocket.waitForEvent('framesent', {
      predicate: makeHotPredicate((event) => {
        return event.type === 'register-entrypoints' && !!event.entryPoints.length;
      }),
    });
    // Observe the handshake with Metro
    await hotSocket.waitForEvent('framereceived', {
      predicate: makeHotPredicate((event) => {
        return event.type === 'bundle-registered';
      }),
    });

    console.time('Press button');
    // Ensure the initial state is correct
    await expect(page.locator('[data-testid="index-count"]')).toHaveText('0');

    // Trigger a state change by clicking a button, then check if the state is rendered to the screen.
    page.locator('[data-testid="index-increment"]').click();
    await expect(page.locator('[data-testid="index-count"]')).toHaveText('1');

    // data-testid="index-text"
    const test = page.locator('[data-testid="index-text"]');
    await expect(test).toHaveText('ROUTE_VALUE');
    console.timeEnd('Press button');

    // Now we'll modify the file and observe a fast refresh event...

    // Use a changing value to prevent caching.
    const nextValue = 'ROUTE_VALUE_' + Date.now();

    console.time('Mutate file');
    // Ensure `const ROUTE_VALUE = 'ROUTE_VALUE_1';` -> `const ROUTE_VALUE = 'ROUTE_VALUE';` before starting
    await mutateIndexFile((contents) => {
      if (!contents.includes("'ROUTE_VALUE'")) {
        throw new Error(`Expected to find 'ROUTE_VALUE' in the file`);
      }
      console.log('Emulate writing to a file');
      return contents.replace(/ROUTE_VALUE/g, nextValue);
    });
    console.timeEnd('Mutate file');

    console.time('Observe update');
    // Metro begins the HMR process
    await raceOrFail(
      hotSocket.waitForEvent('framereceived', {
        predicate: makeHotPredicate((event) => {
          return event.type === 'update-start';
        }),
      }),
      1000,
      'Metro took too long to detect the file change and start the HMR process.'
    );

    // Metro sends the HMR mutation
    await hotSocket.waitForEvent('framereceived', {
      predicate: makeHotPredicate((event) => {
        return event.type === 'update' && !!event.body.modified.length;
      }),
    });

    // Metro completes the HMR update
    await hotSocket.waitForEvent('framereceived', {
      predicate: makeHotPredicate((event) => {
        return event.type === 'update-done';
      }),
    });

    // Observe that our change has been rendered to the screen
    await expect(page.locator('[data-testid="index-text"]')).toHaveText(nextValue);

    // Ensure the state is preserved between updates
    await expect(page.locator('[data-testid="index-count"]')).toHaveText('1');
    console.timeEnd('Observe update');
  });
});

function makeHotPredicate(predicate: (data: Record<string, any>) => boolean) {
  return ({ payload }: { payload: string | Buffer }) => {
    const event = JSON.parse(typeof payload === 'string' ? payload : payload.toString());
    return predicate(event);
  };
}

export const raceOrFail = (promise: Promise<any>, timeout: number, message: string) =>
  Promise.race([
    // Wrap promise with profile logging
    (async () => {
      const start = Date.now();
      const value = await promise;
      const end = Date.now();
      console.log('Resolved:', end - start + 'ms');
      return value;
    })(),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Test was too slow (${timeout}ms): ${message}`));
      }, timeout);
    }),
  ]);
