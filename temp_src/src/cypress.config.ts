import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    viewportHeight: 720,
    viewportWidth: 1080,
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
