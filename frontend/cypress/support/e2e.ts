// You can add global before/after hooks, custom commands, etc.
// Example: take a screenshot after each test failure automatically (Cypress does this on run by default)
afterEach(function () {
  if (this.currentTest && this.currentTest.state === 'failed') {
    cy.screenshot(`failed-${this.currentTest.title}`);
  }
});


