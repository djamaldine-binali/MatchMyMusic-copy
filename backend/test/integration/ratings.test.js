// Import du setup en premier pour configurer les variables d'environnement
const { prisma } = require('./setup/db.setup');
const { createUserWithToken } = require('./setup/auth.utils');
const request = require('supertest');
const app = require('../../index');

describe('CRUD des notes : setRating / getRecent (test d\'intégration)', () => {
  beforeEach(async () => {
    // La base de données est nettoyée automatiquement par db.setup.js
  });

  it('devrait offrir une interface HTTP pour créer/mettre à jour des notes et consulter les plus récentes (succès)', async () => {
    // ============ ÉTAPE 1: CRÉATION D'UNE NOTE ============
    const { user, headers } = await createUserWithToken(
      'ratings@example.com',
      'password123',
      'ratingsuser'
    );

    const ratingData = {
      mbid: 'music123',
      title: 'Test Song',
      albumMbid: 'album456',
      albumTitle: 'Test Album',
      coverUrl: 'https://example.com/cover.jpg',
      value: 5
    };

    const createResponse = await request(app)
      .post('/api/ratings')
      .set(headers)
      .send(ratingData);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('rating');
    expect(createResponse.body.rating).toMatchObject({
      id: expect.any(Number),
      userId: user.id,
      musicId: expect.any(Number),
      value: 5
    });

    // Vérifier que l'album a été créé
    const album = await prisma.album.findUnique({
      where: { mbid: ratingData.albumMbid }
    });
    expect(album).toBeTruthy();
    expect(album.title).toBe(ratingData.albumTitle);

    // Vérifier que la musique a été créée
    const music = await prisma.music.findUnique({
      where: { mbid: ratingData.mbid }
    });
    expect(music).toBeTruthy();
    expect(music.title).toBe(ratingData.title);

    // Vérifier que la note a été créée
    const rating = await prisma.rating.findFirst({
      where: { userId: user.id, musicId: music.id }
    });
    expect(rating).toBeTruthy();
    expect(rating.value).toBe(5);

    // ============ ÉTAPE 2: MISE À JOUR DE LA NOTE ============
    const updateData = {
      mbid: 'music123',
      title: 'Test Song',
      value: 4 // Nouvelle valeur
    };

    const updateResponse = await request(app)
      .post('/api/ratings')
      .set(headers)
      .send(updateData);

    expect(updateResponse.status).toBe(201);
    expect(updateResponse.body.rating.value).toBe(4);

    // Vérifier que la note a été mise à jour
    const updatedRating = await prisma.rating.findFirst({
      where: { userId: user.id, musicId: music.id }
    });
    expect(updatedRating.value).toBe(4);
    expect(updatedRating.id).toBe(rating.id); // Même ID

    // ============ ÉTAPE 3: CONSULTATION DES NOTES RÉCENTES ============
    const getRecentResponse = await request(app)
      .get('/api/ratings/recent')
      .set(headers);

    expect(getRecentResponse.status).toBe(200);
    expect(getRecentResponse.body).toHaveProperty('items');
    expect(getRecentResponse.body.items).toHaveLength(1);
    expect(getRecentResponse.body.items[0]).toMatchObject({
      id: rating.id,
      value: 4,
      title: ratingData.title,
      mbid: ratingData.mbid,
      albumTitle: ratingData.albumTitle
    });
  });

  it('devrait rejeter les notes invalides avec un message d\'erreur (erreur)', async () => {
    // ============ ÉTAPE 1: NOTE SANS AUTHENTIFICATION ============
    const ratingData = {
      mbid: 'music789',
      title: 'Unauthorized Rating',
      value: 5
    };

    const createResponse = await request(app)
      .post('/api/ratings')
      .send(ratingData);

    expect(createResponse.status).toBe(401);
    expect(createResponse.body).toHaveProperty('error');

    // ============ ÉTAPE 2: NOTE AVEC VALEUR INVALIDE ============
    const { headers } = await createUserWithToken(
      'test@example.com',
      'password123',
      'testuser'
    );

    const invalidRatingData = {
      mbid: 'music999',
      title: 'Invalid Rating',
      value: 6 // Valeur hors de 1-5
    };

    const invalidResponse = await request(app)
      .post('/api/ratings')
      .set(headers)
      .send(invalidRatingData);

    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body).toHaveProperty('error');
    expect(invalidResponse.body.error).toContain('Valeur de note invalide');

    // ============ ÉTAPE 3: CONSULTATION SANS AUTHENTIFICATION ============
    const getRecentResponse = await request(app)
      .get('/api/ratings/recent');

    expect(getRecentResponse.status).toBe(401);
    expect(getRecentResponse.body).toHaveProperty('error');
  });
});
