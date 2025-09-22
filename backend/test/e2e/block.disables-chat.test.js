// E2E test for scenario: test/e2e/scenarios/block.disables-chat.md
const request = require('supertest');
const { prisma } = require('../integration/setup/db.setup');
const { createUserWithToken } = require('../integration/setup/auth.utils');
const app = require('../../index');

describe('E2E - Blocking a user disables chat interactions', () => {
  test('when A blocks B, B cannot access conversation or send messages', async () => {
    const { user: userA, token: tokenA } = await createUserWithToken('ba@example.com', 'Passw0rd!', 'blockerA');
    const { user: userB, token: tokenB } = await createUserWithToken('bb@example.com', 'Passw0rd!', 'blockedB');

    // Create a match between A and B
    const match = await prisma.match.create({ data: { userAId: userA.id, userBId: userB.id, score: 0.8 } });

    // A creates or fetches the conversation
    const convRes = await request(app)
      .get(`/api/chat/match/${match.id}/conversation`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(convRes.status).toBe(200);
    const conversationId = convRes.body.conversation.id;

    // A blocks B
    const blockRes = await request(app)
      .post('/api/blocks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ blockedId: userB.id, reason: 'spam' });
    expect(blockRes.status).toBe(200);
    expect(blockRes.body).toHaveProperty('success', true);

    // B tries to send a message → should be forbidden
    const sendByB = await request(app)
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ content: 'Hi A' });
    expect(sendByB.status).toBe(403);

    // B tries to read messages → should be forbidden
    const readByB = await request(app)
      .get(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(readByB.status).toBe(403);
  });
});


