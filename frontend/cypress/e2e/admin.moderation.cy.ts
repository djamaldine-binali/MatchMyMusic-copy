/// <reference types="cypress" />
describe('UI - Admin moderation', () => {
  it('admin moderates users and content (skeleton)', () => {
    cy.visit('/');
    cy.screenshot('admin-moderation-skeleton');
  });
});
