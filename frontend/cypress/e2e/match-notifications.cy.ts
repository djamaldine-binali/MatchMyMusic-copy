/// <reference types="cypress" />
describe('UI - Match notifications', () => {
  it('shows notifications after a match (skeleton)', () => {
    cy.visit('/');
    cy.screenshot('match-notifications-skeleton');
  });
});
