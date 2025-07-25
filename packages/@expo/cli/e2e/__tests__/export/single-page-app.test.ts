/* eslint-env jest */
import fs from 'fs';
import path from 'path';

import { runExportSideEffects } from './export-side-effects';
import { executeExpoAsync } from '../../utils/expo';
import { getRouterE2ERoot, getPageHtml, findProjectFiles } from '../utils';

runExportSideEffects();

describe('exports with single-page', () => {
  const projectRoot = getRouterE2ERoot();
  const outputName = 'dist-spa';
  const outputDir = path.join(projectRoot, outputName);

  beforeAll(async () => {
    await executeExpoAsync(projectRoot, ['export', '-p', 'web', '--output-dir', outputName], {
      env: {
        NODE_ENV: 'production',
        EXPO_USE_STATIC: 'single',
        E2E_ROUTER_SRC: 'static-rendering',
        E2E_ROUTER_ASYNC: 'development',
        EXPO_USE_FAST_RESOLVER: 'true',
      },
    });
  });

  it('has expected files', async () => {
    const files = findProjectFiles(outputDir);

    // The wrapper should not be included as a route.
    expect(files).not.toContain('+html.html');
    expect(files).not.toContain('_layout.html');
    expect(files).not.toContain('about.html');

    // Single page
    expect(files).toContain('index.html');

    // expect(files).toBe([
    //   '_expo/static/css/global-67b6bc5b348b2db946e81c5f0040f565.css',
    //   '_expo/static/css/test.module-2e80684560f145dd976dab27f0bd1062.css',
    //   'assets/35ba0eaec5a4f5ed12ca16fabeae451d',
    //   'assets/369745d4a4a6fa62fa0ed495f89aa964',
    //   'assets/4f355ba1efca4b9c0e7a6271af047f61',
    //   'assets/5223c8d9b0d08b82a5670fb5f71faf78',
    //   'assets/563d5e3294b67811d0a1aede6f601e30',
    //   'assets/5974eb3e1c5314e8d5a822702d7d0740',
    //   'assets/5b50965d3dfbc518fe50ce36c314a6ec',
    //   'assets/817aca47ff3cea63020753d336e628a4',
    //   'assets/9d9c5644f55c2f6e4b7f247c378b2fe9',
    //   'assets/__packages/@expo/metro-runtime/assets/alert-triangle.png',
    //   'assets/__packages/@expo/metro-runtime/assets/chevron-left.png',
    //   'assets/__packages/@expo/metro-runtime/assets/chevron-right.png',
    //   'assets/__packages/@expo/metro-runtime/assets/close.png',
    //   'assets/__packages/@expo/metro-runtime/assets/loader.png',
    //   'assets/__packages/expo-router/assets/error.png',
    //   'assets/__packages/expo-router/assets/file.png',
    //   'assets/__packages/expo-router/assets/forward.png',
    //   'assets/__packages/expo-router/assets/pkg.png',
    //   'assets/b6c297a501e289394b0bc5dc69c265e6',
    //   'assets/e62addcde857ebdb7342e6b9f1095e97',
    //   'bundles/web-e5c890886338c2296ecf737befa2cc66.js',
    //   'index.html',
    //   'metadata.json',
    // ]);
  });

  it('can use environment variables', async () => {
    const indexHtml = await getPageHtml(outputDir, 'index.html');

    const queryMeta = (name: string) =>
      indexHtml.querySelector(`html > head > meta[name="${name}"]`)?.attributes.content;

    [
      'expo-e2e-public-env-var',
      'expo-e2e-private-env-var',
      'expo-e2e-public-env-var-client',
      'expo-e2e-private-env-var-client',
    ].forEach((name) => {
      expect(queryMeta(name)).not.toBeDefined();
    });

    indexHtml
      .querySelectorAll('script')
      .filter((script) => script.attributes.src)
      .forEach((script) => {
        const jsBundle = fs.readFileSync(path.join(outputDir, script.attributes.src), 'utf8');

        // Ensure the bundle is valid
        expect(jsBundle).toMatch('__BUNDLE_START_TIME__');
        // Ensure the non-public env var is not included in the bundle
        expect(jsBundle).not.toMatch('not-public-value');
      });
  });

  it('static styles are injected', async () => {
    const indexHtml = await getPageHtml(outputDir, 'index.html');
    expect(indexHtml.querySelectorAll('html > head > style')?.length).toBe(
      // Whatever was in the template
      1
    );
  });

  // Static CSS works mostly the same across static and SPA modes.
  it('statically extracts CSS', async () => {
    // Unfortunately, the CSS is injected in every page for now since we don't have bundle splitting.
    const indexHtml = await getPageHtml(outputDir, 'index.html');

    const links = indexHtml.querySelectorAll('html > head > link');
    expect(links.length).toBe(
      // Global CSS, CSS Module, Vaul Modal CSS (and entry point)
      6
    );

    const linkStrings = links.map((l) => l.toString());

    expect(linkStrings).toEqual(
      expect.arrayContaining([
        // Global CSS
        expect.stringMatching(
          /<link rel="preload" href="\/_expo\/static\/css\/global-(?<md5>[0-9a-fA-F]{32})\.css" as="style">/
        ),
        expect.stringMatching(
          /<link rel="stylesheet" href="\/_expo\/static\/css\/global-(?<md5>[0-9a-fA-F]{32})\.css">/
        ),
        // Modal CSS
        expect.stringMatching(
          /<link rel="preload" href="\/_expo\/static\/css\/modal\.module-(?<md5>[0-9a-fA-F]{32})\.css" as="style">/
        ),
        expect.stringMatching(
          /<link rel="stylesheet" href="\/_expo\/static\/css\/modal\.module-(?<md5>[0-9a-fA-F]{32})\.css">/
        ),
        // Test CSS module
        expect.stringMatching(
          /<link rel="preload" href="\/_expo\/static\/css\/test\.module-(?<md5>[0-9a-fA-F]{32})\.css" as="style">/
        ),
        expect.stringMatching(
          /<link rel="stylesheet" href="\/_expo\/static\/css\/test\.module-(?<md5>[0-9a-fA-F]{32})\.css">/
        ),
      ])
    );

    const globalPreload = links.find((l) => /global-.*\.css/.test(l.attributes.href!));
    expect(globalPreload).toBeDefined();
    if (globalPreload) {
      expect(
        fs.readFileSync(path.join(outputDir, globalPreload.attributes.href), 'utf-8')
      ).toMatchInlineSnapshot(`"div{background:#0ff}"`);
    }

    const testPreload = links.find((l) => /test\.module-.*\.css/.test(l.attributes.href!));
    expect(testPreload).toBeDefined();
    if (testPreload) {
      expect(
        fs.readFileSync(path.join(outputDir, testPreload.attributes.href), 'utf-8')
      ).toMatchInlineSnapshot(`".HPV33q_text{color:#1e90ff}"`);
    }
  });

  it('does not statically render the head', async () => {
    const indexHtml = await getPageHtml(outputDir, 'index.html');
    expect(indexHtml.querySelector('html > head > title')?.innerText).toBe('Router E2E');

    expect(indexHtml.querySelector('html > head > meta[name="description"]')).toBeNull();
    expect(
      // Nested from app/_layout.js
      indexHtml.querySelector('html > head > meta[name="expo-nested-layout"]')
    ).toBeNull();
  });
});
