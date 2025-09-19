// Import du setup en premier pour configurer les variables d'environnement
const { prisma } = require('./setup/db.setup');
const { createUserWithToken } = require('./setup/auth.utils');
const request = require('supertest');
const app = require('../../index');

describe('CRUD des favoris musicaux : addFavorite / getFavorites / deleteFavorite (test d\'intégration)', () => {
  beforeEach(async () => {
    // La base de données est nettoyée automatiquement par db.setup.js
  });

  it('devrait permettre d\'ajouter, lister (paginé) et retirer des favoris d\'un utilisateur authentifié (succès)', async () => {
    // ============ ÉTAPE 1: AJOUT D'UN FAVORI ============
    const { user, headers } = await createUserWithToken(
      'favorites@example.com',
      'password123',
      'favoritesuser'
    );

    const musicData = {
      musicId: 'music123',
      title: 'Test Song',
      artist: 'Test Artist',
      coverUrl: 'https://example.com/cover.jpg'
    };

    const addResponse = await request(app)
      .post('/api/music/favorites')
      .set(headers)
      .send(musicData);

    expect(addResponse.status).toBe(201);
    expect(addResponse.body).toHaveProperty('userMusic');
    expect(addResponse.body).toHaveProperty('message');

    // Vérifier que la musique a été créée
    const music = await prisma.music.findUnique({
      where: { mbid: musicData.musicId }
    });
    expect(music).toBeTruthy();
    expect(music.title).toBe(musicData.title);

    // Vérifier que le favori a été créé
    const favorite = await prisma.favorite.findFirst({
      where: { userId: user.id, musicId: music.id }
    });
    expect(favorite).toBeTruthy();

    // ============ ÉTAPE 2: LISTE DES FAVORIS (PAGINÉE) ============
    const getResponse = await request(app)
      .get('/api/music/favorites')
      .set(headers)
      .query({ page: 1, pageSize: 10 });

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty('items');
    expect(getResponse.body).toHaveProperty('total');
    expect(getResponse.body.items).toHaveLength(1);
    expect(getResponse.body.total).toBe(1);
    expect(getResponse.body.items[0]).toMatchObject({
      id: favorite.id,
      musicId: music.id,
      mbid: musicData.musicId,
      title: musicData.title
    });

    // ============ ÉTAPE 3: SUPPRESSION DU FAVORI ============
    const deleteResponse = await request(app)
      .delete(`/api/music/favorites/${favorite.id}`)
      .set(headers);

    expect(deleteResponse.status).toBe(204);

    // Vérifier que le favori a été supprimé
    const deletedFavorite = await prisma.favorite.findUnique({
      where: { id: favorite.id }
    });
    expect(deletedFavorite).toBeNull();

    // Vérifier que la liste est maintenant vide
    const getAfterDeleteResponse = await request(app)
      .get('/api/music/favorites')
      .set(headers);

    expect(getAfterDeleteResponse.status).toBe(200);
    expect(getAfterDeleteResponse.body.items).toHaveLength(0);
    expect(getAfterDeleteResponse.body.total).toBe(0);
  });

  it('devrait refuser toute action non autorisée ou incohérente (erreur)', async () => {
    // ============ ÉTAPE 1: AJOUT SANS AUTHENTIFICATION ============
    const musicData = {
      musicId: 'music456',
      title: 'Unauthorized Song'
    };

    const addResponse = await request(app)
      .post('/api/music/favorites')
      .send(musicData);

    expect(addResponse.status).toBe(401);
    expect(addResponse.body).toHaveProperty('error');

    // ============ ÉTAPE 2: LISTE SANS AUTHENTIFICATION ============
    const getResponse = await request(app)
      .get('/api/music/favorites');

    expect(getResponse.status).toBe(401);
    expect(getResponse.body).toHaveProperty('error');

    // ============ ÉTAPE 3: SUPPRESSION SANS AUTHENTIFICATION ============
    const deleteResponse = await request(app)
      .delete('/api/music/favorites/1');

    expect(deleteResponse.status).toBe(401);
    expect(deleteResponse.body).toHaveProperty('error');

    // ============ ÉTAPE 4: AJOUT AVEC DONNÉES MANQUANTES ============
    const { headers } = await createUserWithToken(
      'test@example.com',
      'password123',
      'testuser'
    );

    const incompleteData = {
      // musicId manquant
      title: 'Incomplete Song'
    };

    const addIncompleteResponse = await request(app)
      .post('/api/music/favorites')
      .set(headers)
      .send(incompleteData);

    expect(addIncompleteResponse.status).toBe(400);
    expect(addIncompleteResponse.body).toHaveProperty('error');
  });
});
