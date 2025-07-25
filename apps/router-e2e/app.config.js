const path = require('node:path');

const subdomain = process.env.EXPO_TUNNEL_SUBDOMAIN ?? 'expo-e2e-universal-linking';

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'Router E2E',
  slug: 'expo-router-e2e',

  sdkVersion: process.env.E2E_ROUTER_USE_PUBLISHED_EXPO_GO ? undefined : 'UNVERSIONED',
  icon: './assets/icon.png',
  scheme: 'router-e2e',

  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    appleTeamId: process.env.APPLE_TEAM_ID,
    bundleIdentifier: process.env.APPLE_BUNDLE_ID ?? 'com.expo.routere2e',
    associatedDomains: [
      `applinks:${subdomain}.ngrok.io`,
      `webcredentials:${subdomain}.ngrok.io`,
      `activitycontinuation:${subdomain}.ngrok.io`,
    ],
  },
  android: {
    package: 'dev.expo.routere2e',
  },
  // For testing the output bundle
  jsEngine: process.env.E2E_ROUTER_JS_ENGINE ?? (process.env.E2E_ROUTER_SRC ? 'jsc' : 'hermes'),
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  experiments: {
    baseUrl: process.env.EXPO_E2E_BASE_PATH || undefined,
    tsconfigPaths: process.env.EXPO_USE_PATH_ALIASES,
    typedRoutes: true,
    reactCanary: process.env.E2E_CANARY_ENABLED,
    reactCompiler: process.env.E2E_ROUTER_COMPILER,
    reactServerComponentRoutes: process.env.E2E_RSC_ENABLED,
    reactServerFunctions: process.env.E2E_SERVER_FUNCTIONS,
  },
  web: {
    output: process.env.EXPO_USE_STATIC ?? 'static',
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        ios: {
          ccacheEnabled: true,
        },
      },
    ],

    [
      'expo-router',
      {
        asyncRoutes:
          process.env.E2E_ROUTER_ASYNC === 'true'
            ? true
            : process.env.E2E_ROUTER_ASYNC === 'false'
              ? false
              : process.env.E2E_ROUTER_ASYNC || false,
        root: path.join('__e2e__', process.env.E2E_ROUTER_SRC ?? 'static-rendering', 'app'),
        origin: 'http://localhost:8081/',
        sitemap:
          process.env.E2E_ROUTER_SITEMAP === 'false' ? false : process.env.E2E_ROUTER_SITEMAP,
        redirects: process.env.E2E_ROUTER_REDIRECTS
          ? JSON.parse(process.env.E2E_ROUTER_REDIRECTS)
          : undefined,
        rewrites: process.env.E2E_ROUTER_REWRITES
          ? JSON.parse(process.env.E2E_ROUTER_REWRITES)
          : undefined,
      },
    ],
  ],
};

if (typeof process.env.E2E_ROUTER_SRC === 'string') {
  process.env.EXPO_PUBLIC_FOLDER = path.join('__e2e__', process.env.E2E_ROUTER_SRC, 'public');
}
