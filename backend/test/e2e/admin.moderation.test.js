// E2E test for scenario: test/e2e/scenarios/admin.moderation.md
const request = require('supertest');
const { prisma } = require('../integration/setup/db.setup');
const { createUserWithToken, createAdminWithToken } = require('../integration/setup/auth.utils');
const app = require('../../index');

describe('E2E - Admin Moderation', () => {
  test('admin can list users and soft-delete/restore a user', async () => {
    // Create admin and a normal user
    const { token: adminToken } = await createAdminWithToken('admin@example.com', 'Passw0rd!', 'admin');
    const { user: normalUser } = await createUserWithToken('user@example.com', 'Passw0rd!', 'user');

    // List users
    const listRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty('success', true);
    expect(Array.isArray(listRes.body.users)).toBe(true);

    // Delete user (soft-delete expected)
    const delRes = await request(app)
      .delete(`/api/admin/users/${normalUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body).toHaveProperty('success', true);

    const deleted = await prisma.user.findUnique({ where: { id: normalUser.id } });
    expect(deleted.isDeleted).toBe(true);

    // Restore user
    const restoreRes = await request(app)
      .patch(`/api/admin/users/${normalUser.id}/restore`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body).toHaveProperty('success', true);

    const restored = await prisma.user.findUnique({ where: { id: normalUser.id } });
    expect(restored.isDeleted).toBe(false);
  });
});


