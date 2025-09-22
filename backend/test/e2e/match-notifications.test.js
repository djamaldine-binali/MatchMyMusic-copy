// E2E test for scenario: test/e2e/scenarios/match-notifications.md
const request = require('supertest');
const { prisma } = require('../integration/setup/db.setup');
const { createUserWithToken } = require('../integration/setup/auth.utils');
const app = require('../../index');

describe('E2E - Match creates notifications for both users', () => {
  test('users with common favorites lead to match and notifications', async () => {
    // Create two users
    const { user: userA, token: tokenA } = await createUserWithToken('ma@example.com', 'Passw0rd!', 'matchA');
    const { user: userB, token: tokenB } = await createUserWithToken('mb@example.com', 'Passw0rd!', 'matchB');

    // Seed one album and one music
    const album = await prisma.album.create({ data: { mbid: 'alb1', title: 'Album 1', coverUrl: null } });
    const music = await prisma.music.create({ data: { mbid: 'msc1', title: 'Track 1', albumId: album.id } });

    // Add same favorite for both users
    await prisma.favorite.create({ data: { userId: userA.id, musicId: music.id } });
    await prisma.favorite.create({ data: { userId: userB.id, musicId: music.id } });

    // Trigger matching for user A (minCommonItems in service defaults to 10, so ensure enough overlap)
    // We’ll add more overlapping ratings to reach threshold
    for (let i = 0; i < 10; i++) {
      const m = await prisma.music.create({ data: { mbid: `msc_extra_${i}`, title: `Extra ${i}`, albumId: album.id } });
      await prisma.rating.create({ data: { userId: userA.id, musicId: m.id, value: 5 } });
      await prisma.rating.create({ data: { userId: userB.id, musicId: m.id, value: 5 } });
    }

    // Call GET /api/matches to compute matches for A and create notifications
    const matchesRes = await request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(matchesRes.status).toBe(200);
    expect(matchesRes.body).toHaveProperty('success', true);
    const found = matchesRes.body.matches.find(m => m.userId === userB.id);
    expect(found).toBeTruthy();

    // Check notifications for A
    const notifA = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(notifA.status).toBe(200);
    expect(notifA.body.notifications.some(n => n.type === 'new_match')).toBe(true);

    // Check notifications for B
    const notifB = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(notifB.status).toBe(200);
    expect(notifB.body.notifications.some(n => n.type === 'new_match')).toBe(true);
  });
});


