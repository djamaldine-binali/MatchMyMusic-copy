/// <reference types="cypress" />
describe('UI - Chat conversation/messages', () => {
  it('shows conversation and message exchange (skeleton)', () => {
    cy.visit('/');
    cy.screenshot('chat-skeleton');
  });
});
