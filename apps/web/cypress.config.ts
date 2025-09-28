import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/e2e.ts',
    downloadsFolder: 'tests/e2e/downloads',
    fixturesFolder: 'tests/e2e/fixtures',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      USE_MOCK_SERVICES: 'true',
    },
    setupNodeEvents(on, config) {
      // WebRTC testing setup
      on('before:browser:launch', (browser, launchOptions) => {
        // Enable WebRTC features in headless mode
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--use-fake-ui-for-media-stream');
          launchOptions.args.push('--use-fake-device-for-media-stream');
          launchOptions.args.push('--autoplay-policy=no-user-gesture-required');
        }

        if (browser.name === 'firefox') {
          launchOptions.preferences['media.navigator.streams.fake'] = true;
          launchOptions.preferences['media.navigator.permission.disabled'] = true;
        }

        return launchOptions;
      });

      // Custom task for WebRTC testing
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        // Simulate different network conditions
        setNetworkConditions(conditions) {
          // This would integrate with browser dev tools protocol
          // to simulate network conditions for WebRTC testing
          console.log('Setting network conditions:', conditions);
          return null;
        },
      });

      return config;
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/component.ts',
  },
});