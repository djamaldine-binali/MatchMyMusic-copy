// E2E test for scenario: test/e2e/scenarios/register-login-profile.md
const request = require('supertest');
// Ensure DB env and schema are prepared before importing the app
const { prisma } = require('../integration/setup/db.setup');
const app = require('../../index');

describe('E2E - Register → Login → Profile', () => {
  test('should register, login and access protected profile', async () => {
    const userData = {
      email: 'e2e_user@example.com',
      username: 'e2euser',
      password: 'StrongPassw0rd!'
    };

    // 1) Register
    const registerResponse = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('user');
    expect(registerResponse.body.user).toMatchObject({
      id: expect.any(Number),
      email: userData.email,
      username: userData.username,
      isAdmin: false,
      isDeleted: false
    });

    const createdUser = await prisma.user.findUnique({ where: { email: userData.email } });
    expect(createdUser).toBeTruthy();
    expect(createdUser.password).not.toBe(userData.password);

    // 2) Login
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ email: userData.email, password: userData.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');
    const token = loginResponse.body.token;
    expect(typeof token).toBe('string');

    // 3) Get Profile (protected)
    const profileResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body).toHaveProperty('user');
    expect(profileResponse.body.user).toMatchObject({
      id: createdUser.id,
      email: userData.email,
      username: userData.username,
      isAdmin: false
    });
    expect(profileResponse.body.user).not.toHaveProperty('password');
  });
});


