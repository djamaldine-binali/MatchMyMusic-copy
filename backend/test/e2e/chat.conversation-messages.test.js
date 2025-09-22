// E2E test for scenario: test/e2e/scenarios/chat.conversation-messages.md
const request = require('supertest');
// Ensure DB env is set before importing the app
const { prisma } = require('../integration/setup/db.setup');
const { createUserWithToken } = require('../integration/setup/auth.utils');
const app = require('../../index');

describe('E2E - Chat conversation and messages', () => {
  test('user A and user B can create conversation from match and exchange messages', async () => {
    // Arrange: create two users and tokens
    const { user: userA, token: tokenA } = await createUserWithToken('a@example.com', 'Passw0rd!', 'userA');
    const { user: userB, token: tokenB } = await createUserWithToken('b@example.com', 'Passw0rd!', 'userB');

    // Create a match between A and B directly in DB
    const match = await prisma.match.create({
      data: { userAId: userA.id, userBId: userB.id, score: 0.9 }
    });

    // Act: user A gets or creates conversation for this match
    const convRes = await request(app)
      .get(`/api/chat/match/${match.id}/conversation`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(convRes.status).toBe(200);
    expect(convRes.body).toHaveProperty('success', true);
    const conversationId = convRes.body.conversation.id;
    expect(typeof conversationId).toBe('number');

    // Act: user A sends a message
    const content = 'Hello from A to B';
    const sendRes = await request(app)
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content });

    expect(sendRes.status).toBe(200);
    expect(sendRes.body).toHaveProperty('success', true);
    expect(sendRes.body.message).toMatchObject({ content, senderId: userA.id, conversationId });

    // Assert: user B can fetch messages and see the one from A
    const listRes = await request(app)
      .get(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenB}`)
      .query({ page: 1, pageSize: 50 });

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty('success', true);
    expect(Array.isArray(listRes.body.messages)).toBe(true);
    const found = listRes.body.messages.find(m => m.content === content && m.senderId === userA.id);
    expect(found).toBeTruthy();
  });
});


