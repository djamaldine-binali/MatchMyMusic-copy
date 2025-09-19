// Import du setup en premier pour configurer les variables d'environnement
const { prisma } = require('./setup/db.setup');
const request = require('supertest');
const app = require('../../index');

describe('Parcours utilisateur complet : register → login → getProfile (test d\'intégration)', () => {
  beforeEach(async () => {
    // La base de données est nettoyée automatiquement par db.setup.js
  });

  it('devrait valider le parcours complet d\'inscription, d\'authentification puis d\'accès au profil protégé (succès)', async () => {
    // ============ ÉTAPE 1: INSCRIPTION ============
    const userData = {
      email: 'journey@example.com',
      username: 'journeyuser',
      password: 'JourneyPassword123!'
    };

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

    // Vérifier que l'utilisateur a été créé en base
    const createdUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    expect(createdUser).toBeTruthy();
    expect(createdUser.password).not.toBe(userData.password); // Mot de passe haché

    // ============ ÉTAPE 2: CONNEXION ============
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');
    expect(typeof loginResponse.body.token).toBe('string');

    const token = loginResponse.body.token;

    // ============ ÉTAPE 3: ACCÈS AU PROFIL ============
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

  it('devrait interrompre le parcours si l\'inscription échoue (erreur)', async () => {
    // ============ ÉTAPE 1: INSCRIPTION ÉCHOUÉE ============
    const userData = {
      email: 'journey2@example.com',
      username: 'journeyuser2',
      password: 'JourneyPassword123!'
    };

    // Créer d'abord un utilisateur avec le même email
    await prisma.user.create({
      data: {
        email: userData.email,
        username: 'existing',
        password: 'hashedpassword',
        isAdmin: false,
        isDeleted: false
      }
    });

    const registerResponse = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(registerResponse.status).toBe(400);
    expect(registerResponse.body).toHaveProperty('error');
    expect(registerResponse.body.error).toContain('User already exists');

    // ============ ÉTAPE 2: TENTATIVE DE CONNEXION (doit échouer) ============
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body).toHaveProperty('error');
    expect(loginResponse.body.error).toContain('Invalid credentials');

    // ============ ÉTAPE 3: TENTATIVE D'ACCÈS AU PROFIL (doit échouer) ============
    const profileResponse = await request(app)
      .get('/api/users/profile');

    expect(profileResponse.status).toBe(401);
    expect(profileResponse.body).toHaveProperty('error');
  });

  it('devrait interrompre le parcours si la connexion échoue (erreur)', async () => {
    // ============ ÉTAPE 1: INSCRIPTION RÉUSSIE ============
    const userData = {
      email: 'journey3@example.com',
      username: 'journeyuser3',
      password: 'JourneyPassword123!'
    };

    const registerResponse = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(registerResponse.status).toBe(201);

    // ============ ÉTAPE 2: CONNEXION ÉCHOUÉE (mauvais mot de passe) ============
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        email: userData.email,
        password: 'WrongPassword123!'
      });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body).toHaveProperty('error');
    expect(loginResponse.body.error).toContain('Invalid credentials');

    // ============ ÉTAPE 3: TENTATIVE D'ACCÈS AU PROFIL (doit échouer) ============
    const profileResponse = await request(app)
      .get('/api/users/profile');

    expect(profileResponse.status).toBe(401);
    expect(profileResponse.body).toHaveProperty('error');
  });
});
