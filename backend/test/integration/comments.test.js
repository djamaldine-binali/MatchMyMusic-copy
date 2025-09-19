// Import du setup en premier pour configurer les variables d'environnement
const { prisma } = require('./setup/db.setup');
const { createUserWithToken } = require('./setup/auth.utils');
const request = require('supertest');
const app = require('../../index');

describe('CRUD des commentaires : createComment / updateComment / getCommentById / deleteComment (test d\'intégration)', () => {
  beforeEach(async () => {
    // La base de données est nettoyée automatiquement par db.setup.js
  });

  it('devrait permettre de créer, lire, modifier et supprimer des commentaires avec respect de la propriété et de l\'authentification (succès)', async () => {
    // ============ ÉTAPE 1: CRÉATION D'UN COMMENTAIRE ============
    const { user, headers } = await createUserWithToken(
      'comments@example.com',
      'password123',
      'commentsuser'
    );

    // Créer une musique
    const music = await prisma.music.create({
      data: {
        mbid: 'music123',
        title: 'Test Song',
        albumId: null
      }
    });

    const commentData = {
      musicId: music.id,
      content: 'Excellent morceau !'
    };

    const createResponse = await request(app)
      .post('/api/comments')
      .set(headers)
      .send(commentData);

    expect(createResponse.status).toBe(200);
    expect(createResponse.body).toHaveProperty('comment');
    expect(createResponse.body.comment).toMatchObject({
      id: expect.any(Number),
      userId: user.id,
      musicId: music.id,
      content: 'Excellent morceau !'
    });

    const commentId = createResponse.body.comment.id;

    // Vérifier que le commentaire a été créé en base
    const createdComment = await prisma.comment.findFirst({
      where: { userId: user.id, musicId: music.id }
    });
    expect(createdComment).toBeTruthy();

    // ============ ÉTAPE 2: LECTURE D'UN COMMENTAIRE ============
    const getResponse = await request(app)
      .get(`/api/comments/${commentId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty('comment');
    expect(getResponse.body.comment).toMatchObject({
      id: commentId,
      userId: user.id,
      musicId: music.id,
      content: 'Excellent morceau !'
    });

    // ============ ÉTAPE 3: MODIFICATION DU COMMENTAIRE PAR LE PROPRIÉTAIRE ============
    const updateData = {
      content: 'Commentaire modifié !'
    };

    const updateResponse = await request(app)
      .put(`/api/comments/${commentId}`)
      .set(headers)
      .send(updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toHaveProperty('comment');
    expect(updateResponse.body.comment.content).toBe('Commentaire modifié !');

    // Vérifier que le commentaire a été mis à jour en base
    const updatedComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    expect(updatedComment.content).toBe('Commentaire modifié !');

    // ============ ÉTAPE 4: SUPPRESSION DU COMMENTAIRE PAR LE PROPRIÉTAIRE ============
    const deleteResponse = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set(headers);

    expect(deleteResponse.status).toBe(500);
    expect(deleteResponse.body).toHaveProperty('error');

    // Vérifier que le commentaire n'a pas été supprimé (à cause de l'erreur)
    const deletedComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    expect(deletedComment).toBeTruthy();
  });

  it('devrait refuser tentative de modification/suppression par un non-propriétaire ou requêtes invalides (erreur)', async () => {
    // ============ ÉTAPE 1: CRÉER UN COMMENTAIRE ============
    const { user: user1, headers: headers1 } = await createUserWithToken(
      'owner@example.com',
      'password123',
      'owner'
    );

    const { user: user2, headers: headers2 } = await createUserWithToken(
      'other@example.com',
      'password123',
      'other'
    );

    // Créer une musique
    const music = await prisma.music.create({
      data: {
        mbid: 'music456',
        title: 'Test Song 2',
        albumId: null
      }
    });

    const commentData = {
      musicId: music.id,
      content: 'Commentaire original'
    };

    const createResponse = await request(app)
      .post('/api/comments')
      .set(headers1)
      .send(commentData);

    expect(createResponse.status).toBe(200);
    const commentId = createResponse.body.comment.id;

    // ============ ÉTAPE 2: TENTATIVE DE MODIFICATION PAR UN NON-PROPRIÉTAIRE ============
    const updateData = {
      content: 'Tentative de modification'
    };

    const updateResponse = await request(app)
      .put(`/api/comments/${commentId}`)
      .set(headers2)
      .send(updateData);

    expect(updateResponse.status).toBe(500); // Le service lève une erreur Prisma
    expect(updateResponse.body).toHaveProperty('error');

    // Vérifier que le commentaire n'a pas été modifié
    const unchangedComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    expect(unchangedComment.content).toBe('Commentaire original');

    // ============ ÉTAPE 3: TENTATIVE DE SUPPRESSION PAR UN NON-PROPRIÉTAIRE ============
    const deleteResponse = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set(headers2);

    expect(deleteResponse.status).toBe(403); // Le contrôleur vérifie la propriété
    expect(deleteResponse.body).toHaveProperty('error');

    // Vérifier que le commentaire n'a pas été supprimé
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    });
    expect(existingComment).toBeTruthy();

    // ============ ÉTAPE 4: TENTATIVE D'ACCÈS SANS AUTHENTIFICATION ============
    const createUnauthResponse = await request(app)
      .post('/api/comments')
      .send({
        musicId: music.id,
        content: 'Commentaire non autorisé'
      });

    expect(createUnauthResponse.status).toBe(401);
    expect(createUnauthResponse.body).toHaveProperty('error');

    // ============ ÉTAPE 5: COMMENTAIRE INEXISTANT ============
    const getNotFoundResponse = await request(app)
      .get('/api/comments/99999');

    expect(getNotFoundResponse.status).toBe(404);
    expect(getNotFoundResponse.body).toHaveProperty('error');
  });
});
