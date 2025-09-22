/// <reference types="cypress" />
describe('UI - Chat conversation/messages', () => {
  it('creates a match between two users and exchanges a message in chat', () => {
    const now = Date.now();
    const emailA = `chat_a_${now}@example.com`;
    const emailB = `chat_b_${now}@example.com`;
    const pass = 'StrongPassw0rd!';
    const userA = `userA_${now}`;
    const userB = `userB_${now}`;

    // Helper to register user
    const register = (email: string, username: string) =>
      cy.request('POST', '/api/users/register', { email, username, password: pass });

    // Helper to login and return token
    const login = (email: string) =>
      cy.request('POST', '/api/users/login', { email, password: pass }).then(r => r.body.token as string);

    // Seed N common ratings to trigger matching
    const seedCommonRatings = (tokenA: string, tokenB: string, n = 10) => {
      for (let i = 0; i < n; i++) {
        const mbid = `msc_chat_${now}_${i}`;
        const payload = {
          mbid,
          title: `Track ${i}`,
          albumMbid: `alb_chat_${now}`,
          albumTitle: 'Chat Album',
          coverUrl: null,
          value: 5,
        };
        cy.request({
          method: 'POST',
          url: '/api/ratings',
          headers: { Authorization: `Bearer ${tokenA}` },
          body: payload,
        });
        cy.request({
          method: 'POST',
          url: '/api/ratings',
          headers: { Authorization: `Bearer ${tokenB}` },
          body: payload,
        });
      }
    };

    // Register both users
    register(emailA, userA);
    register(emailB, userB);

    // Login both and seed data
    let tokenA = '';
    let tokenB = '';
    let matchId: number;

    // Login A then B, then continue inside chained callbacks to ensure tokens are set
    cy.request('POST', '/api/users/login', { email: emailA, password: pass }).then(rA => {
      tokenA = (rA.body as any).token;
      expect(tokenA, 'tokenA').to.be.a('string').and.not.be.empty;

      cy.request('POST', '/api/users/login', { email: emailB, password: pass }).then(rB => {
        tokenB = (rB.body as any).token;
        expect(tokenB, 'tokenB').to.be.a('string').and.not.be.empty;

        // Seed common ratings
        for (let i = 0; i < 10; i++) {
          const mbid = `msc_chat_${now}_${i}`;
          const payload = {
            mbid,
            title: `Track ${i}`,
            albumMbid: `alb_chat_${now}`,
            albumTitle: 'Chat Album',
            coverUrl: null,
            value: 5,
          };
          cy.request({ method: 'POST', url: '/api/ratings', headers: { Authorization: `Bearer ${tokenA}` }, body: payload });
          cy.request({ method: 'POST', url: '/api/ratings', headers: { Authorization: `Bearer ${tokenB}` }, body: payload });
        }

        // Trigger matching for A and capture matchId
        cy.request({ method: 'GET', url: '/api/matches', headers: { Authorization: `Bearer ${tokenA}` } }).then((res) => {
          expect(res.status).to.eq(200);
          const m = (res.body.matches || []).find((m: any) => m.username === userB);
          expect(!!m).to.eq(true);
          matchId = m.matchId;

          // Ensure conversation exists (create if needed)
          cy.request({ method: 'GET', url: `/api/chat/match/${matchId}/conversation`, headers: { Authorization: `Bearer ${tokenA}` } })
            .its('status').should('eq', 200);

          // Perform UI login for user A
          cy.visit('/login');
          cy.get('#login-email').type(emailA);
          cy.get('#login-password').type(pass);
          cy.contains('button', 'Se connecter').click();
          cy.url().should('include', '/main');

          // Open chat widget and select the conversation
          cy.get('button[title="Chat avec vos matches"]').click();
          cy.contains('Conversations').scrollIntoView().should('exist');
          cy.contains(userB).scrollIntoView().click();
          cy.contains('Aucun message').should('exist');

          // Send a message
          const content = 'Hello from Cypress A';
          cy.get('input[placeholder="Tapez votre message..."]').type(content);
          cy.contains('button', '→').click();
          cy.contains(content).should('be.visible');
        });
      });
    });
  });
});
