/// <reference types="cypress" />
describe('UI - Block disables chat', () => {
  it('blocks user and disables chat inputs (skeleton)', () => {
    cy.visit('/');
    cy.screenshot('block-skeleton');
  });
});
