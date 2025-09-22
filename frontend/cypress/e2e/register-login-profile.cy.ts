/// <reference types="cypress" />
describe('UI - Register/Login/Profile', () => {
  it('navigates register -> login -> profile (skeleton)', () => {
    cy.visit('/');
    cy.screenshot('home-loaded');
    // TODO: implement real UI selectors and flows
  });
});


