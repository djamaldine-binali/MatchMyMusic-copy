/// <reference types="cypress" />
describe('UI - Register/Login/Profile', () => {
  it('registers a new user then logs in and sees profile', () => {
    const email = `e2e_${Date.now()}@example.com`;
    const password = 'StrongPassw0rd!';
    const username = `user_${Date.now()}`;

    // Go to register page
    cy.visit('/register');

    // Step 1: email check
    cy.get('#register-email').type(email);
    cy.contains('button', 'Continuer').click();

    // Branch should be register form
    cy.get('#register-username').type(username);
    cy.get('#register-password').type(password);
    cy.contains('button', "S'inscrire").click();

    // Should show success text
    cy.contains('Inscription ou connexion réussie !').should('be.visible');

    // Now go to login page and login
    cy.visit('/login');
    cy.get('#login-email').type(email);
    cy.get('#login-password').type(password);
    cy.contains('button', 'Se connecter').click();

    // Expect success then redirect to /main
    cy.contains('Connexion réussie !').should('be.visible');
    cy.url().should('include', '/main');

    // Navigate to profile and ensure email/username visible
    cy.visit('/profile');
    cy.contains(username).should('be.visible');
    cy.contains(email).should('be.visible');

    cy.screenshot('profile-after-login');
  });
});


