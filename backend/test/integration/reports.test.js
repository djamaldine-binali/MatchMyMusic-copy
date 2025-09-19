// Import du setup en premier pour configurer les variables d'environnement
const { prisma } = require('./setup/db.setup');
const { createUserWithToken, createAdminWithToken } = require('./setup/auth.utils');
const request = require('supertest');
const app = require('../../index');

describe('Gestion des signalements : reportUser / getAllReportsGrouped / updateReportStatus / deleteReport (test d\'intégration)', () => {
  beforeEach(async () => {
    // La base de données est nettoyée automatiquement par db.setup.js
  });

  it('devrait permettre le signalement d\'utilisateurs et la gestion admin (regroupement, statistiques, changement de statut, suppression) (succès)', async () => {
    // ============ ÉTAPE 1: CRÉATION D'UN SIGNALEMENT ============
    const { user: reporter, headers: reporterHeaders } = await createUserWithToken(
      'reporter@example.com',
      'password123',
      'reporter'
    );

    const { user: reportedUser } = await createUserWithToken(
      'reported@example.com',
      'password123',
      'reported'
    );

    const reportData = {
      reportedId: reportedUser.id,
      reason: 'Spam behavior',
      description: 'User is sending spam messages'
    };

    const createReportResponse = await request(app)
      .post('/api/reports')
      .set(reporterHeaders)
      .send(reportData);

    expect(createReportResponse.status).toBe(200);
    expect(createReportResponse.body).toHaveProperty('report');
    expect(createReportResponse.body.report).toMatchObject({
      id: expect.any(Number),
      reporterId: reporter.id,
      reportedId: reportedUser.id,
      reason: 'Spam behavior',
      status: 'pending'
    });

    const reportId = createReportResponse.body.report.id;

    // Vérifier que le signalement a été créé en base
    const createdReport = await prisma.userReport.findFirst({
      where: { reporterId: reporter.id, reportedId: reportedUser.id }
    });
    expect(createdReport).toBeTruthy();
    expect(createdReport.reason).toBe('Spam behavior');

    // ============ ÉTAPE 2: RÉCUPÉRATION DES SIGNALEMENTS GROUPÉS (ADMIN) ============
    const { headers: adminHeaders } = await createAdminWithToken(
      'admin@example.com',
      'password123',
      'admin'
    );

    const getReportsResponse = await request(app)
      .get('/api/reports/admin/all')
      .set(adminHeaders);

    expect(getReportsResponse.status).toBe(200);
    expect(getReportsResponse.body).toHaveProperty('reports');
    expect(getReportsResponse.body.reports).toHaveLength(1);
    expect(getReportsResponse.body.reports[0]).toMatchObject({
      reportedUserId: reportedUser.id,
      totalReports: 1,
      allReports: expect.arrayContaining([
        expect.objectContaining({
          id: reportId,
          reason: 'Spam behavior',
          status: 'pending'
        })
      ])
    });

    // ============ ÉTAPE 3: MISE À JOUR DU STATUT DU SIGNALEMENT (ADMIN) ============
    const updateStatusData = {
      status: 'resolved'
    };

    const updateStatusResponse = await request(app)
      .patch(`/api/reports/admin/${reportId}/status`)
      .set(adminHeaders)
      .send(updateStatusData);

    expect(updateStatusResponse.status).toBe(200);
    expect(updateStatusResponse.body).toHaveProperty('report');
    expect(updateStatusResponse.body.report.status).toBe('resolved');

    // Vérifier que le statut a été mis à jour en base
    const updatedReport = await prisma.userReport.findUnique({
      where: { id: reportId }
    });
    expect(updatedReport.status).toBe('resolved');

    // ============ ÉTAPE 4: SUPPRESSION DU SIGNALEMENT (ADMIN) ============
    const deleteReportResponse = await request(app)
      .delete(`/api/reports/admin/${reportId}`)
      .set(adminHeaders);

    expect(deleteReportResponse.status).toBe(200);
    expect(deleteReportResponse.body).toHaveProperty('message');

    // Vérifier que le signalement a été supprimé
    const deletedReport = await prisma.userReport.findUnique({
      where: { id: reportId }
    });
    expect(deletedReport).toBeNull();
  });

  it('devrait refuser actions interdites sans droits admin ou données invalides (erreur)', async () => {
    // ============ ÉTAPE 1: TENTATIVE D'ACCÈS ADMIN PAR UN NON-ADMIN ============
    const { headers: userHeaders } = await createUserWithToken(
      'user@example.com',
      'password123',
      'user'
    );

    const getReportsResponse = await request(app)
      .get('/api/reports/admin/all')
      .set(userHeaders);

    expect(getReportsResponse.status).toBe(403);
    expect(getReportsResponse.body).toHaveProperty('error');
    expect(getReportsResponse.body.error).toContain('Admin requis');

    // ============ ÉTAPE 2: TENTATIVE DE MISE À JOUR DE STATUT PAR UN NON-ADMIN ============
    const updateStatusResponse = await request(app)
      .patch('/api/reports/admin/1/status')
      .set(userHeaders)
      .send({ status: 'resolved' });

    expect(updateStatusResponse.status).toBe(403);
    expect(updateStatusResponse.body).toHaveProperty('error');

    // ============ ÉTAPE 3: TENTATIVE DE SUPPRESSION PAR UN NON-ADMIN ============
    const deleteReportResponse = await request(app)
      .delete('/api/reports/admin/1')
      .set(userHeaders);

    expect(deleteReportResponse.status).toBe(403);
    expect(deleteReportResponse.body).toHaveProperty('error');

    // ============ ÉTAPE 4: SIGNALEMENT AVEC DONNÉES INVALIDES ============
    const invalidReportData = {
      // reportedId manquant
      reason: 'Invalid report'
    };

    const createInvalidReportResponse = await request(app)
      .post('/api/reports')
      .set(userHeaders)
      .send(invalidReportData);

    expect(createInvalidReportResponse.status).toBe(400);
    expect(createInvalidReportResponse.body).toHaveProperty('error');

    // ============ ÉTAPE 5: SIGNALEMENT INEXISTANT ============
    const { headers: adminHeaders } = await createAdminWithToken(
      'admin2@example.com',
      'password123',
      'admin2'
    );

    const getNotFoundResponse = await request(app)
      .get('/api/reports/admin/user/99999')
      .set(adminHeaders);

    expect(getNotFoundResponse.status).toBe(200);
    expect(getNotFoundResponse.body).toHaveProperty('reports');
    expect(getNotFoundResponse.body.reports).toHaveLength(0);
  });
});
