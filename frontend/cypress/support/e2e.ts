// Take a screenshot only when a test passes (not on failure)
afterEach(function () {
  if (this.currentTest && this.currentTest.state === 'passed') {
    const safeTitle = this.currentTest.title.replace(/[\/\\?%*:|"<>]/g, '_');
    cy.screenshot(safeTitle, { capture: 'runner' });
  }
});


