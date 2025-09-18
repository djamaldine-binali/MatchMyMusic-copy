// =============================
// Test unitaire: userService.register
// Objectif: Tester LA fonction seule en isolant ses dépendances (Prisma, bcrypt).
// Méthode: Pattern AAA (Arrange -> Act -> Assert)
// - Arrange: préparer l'état/mocks
// - Act: appeler la fonction ciblée
// - Assert: vérifier le résultat et les interactions
// =============================

// 1) On importe la fonction métier à tester (pas l'API HTTP)
const userService = require('../../services/userService');

// 2) On MOCK les dépendances externes pour isoler la fonction
//    Ici: Prisma (accès DB) et bcrypt (hashage). On remplace leurs méthodes
//    par des fonctions Jest contrôlables.
jest.mock('../../prisma/client.js', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  // On choisit une valeur fixe de hash pour rendre le test déterministe
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

// 3) On récupère les mocks pour poser des attentes (haveBeenCalledWith, etc.)
const prisma = require('../../prisma/client.js');
const bcrypt = require('bcrypt');

describe('userService.register (unit)', () => {
  // Avant chaque test, on remet les compteurs d'appels à zéro
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crée un utilisateur quand l’email est inexistant (succès)', async () => {
    // ============ Arrange ============
    // Simuler: aucun utilisateur existant avec cet email
    prisma.user.findUnique.mockResolvedValue(null);
    // Simuler: la création DB renvoie un objet utilisateur minimal
    prisma.user.create.mockResolvedValue({
      id: 123,
      email: 'new.user@test.com',
      username: 'newuser',
    });

    // ============ Act ============
    // Appeler la fonction à tester avec des données valides
    const result = await userService.register({
      email: 'new.user@test.com',
      password: 'Passw0rd!',
      username: 'newuser',
    });

    // ============ Assert ============
    // 1) Vérifie la vérification d'unicité
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'new.user@test.com' } });
    // 2) Vérifie l'appel à bcrypt avec le cost 10 (défini dans le service)
    expect(bcrypt.hash).toHaveBeenCalledWith('Passw0rd!', 10);
    // 3) Vérifie l'insert DB avec le mot de passe haché
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { email: 'new.user@test.com', username: 'newuser', password: 'hashed_password' },
    });
    // 4) Vérifie l'objet renvoyé par la fonction
    expect(result).toMatchObject({ id: 123, email: 'new.user@test.com', username: 'newuser' });
  });

  it('refuse l’inscription si l’email existe déjà (status=400)', async () => {
    // ============ Arrange ============
    // Simuler: un utilisateur existe déjà avec cet email -> le service doit lever une erreur 400
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'dup@test.com' });

    // ============ Act + Assert ============
    // On attend un rejet avec un objet d'erreur contenant status=400
    await expect(
      userService.register({ email: 'dup@test.com', password: 'x', username: 'dup' })
    ).rejects.toMatchObject({ status: 400 });

    // Aucune tentative de création ne doit avoir lieu
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});

// =============================
// Notes pour reproduire ce modèle sur d'autres tests unitaires:
// - Importer uniquement la fonction/service à tester (pas l'app Express).
// - Mock toutes les dépendances externes (DB, crypto, API externes).
// - Utiliser AAA:
//   Arrange: définir les retours de mocks (mockResolvedValue, mockRejectedValue...)
//   Act: appeler la fonction avec les inputs voulus
//   Assert: vérifier les retours ET les interactions (toHaveBeenCalledWith)
// - Garder les tests déterministes: valeurs fixes, pas d'heure réelle si non nécessaire
// =============================
