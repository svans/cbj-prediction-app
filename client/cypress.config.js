// client/cypress.config.js
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Your local dev server
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});