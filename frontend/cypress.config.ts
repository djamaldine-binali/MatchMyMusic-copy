import { defineConfig } from 'cypress';
import fs from 'fs';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.{js,ts}',
    video: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: false,
    setupNodeEvents(on, config) {
      // Keep videos/screenshots only when spec passes; delete on failure
      on('after:spec', (spec, results) => {
        if (!results) return;
        const failed = results.stats.failures > 0;

        if (failed) {
          // Delete video if present
          if (results.video && fs.existsSync(results.video)) {
            try { fs.unlinkSync(results.video); } catch {}
          }
          // Delete any screenshots taken
          if (results.screenshots && results.screenshots.length) {
            for (const s of results.screenshots) {
              if (s.path && fs.existsSync(s.path)) {
                try { fs.unlinkSync(s.path); } catch {}
              }
            }
          }
        }
      });
      return config;
    },
  },
});


