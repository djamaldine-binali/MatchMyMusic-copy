process.env.JWT_SECRET = 'test_secret';
const userService = require('../../services/userService');

jest.mock('../../prisma/client.js', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const prisma = require('../../prisma/client.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logErr = (...parts) => {
  const name = expect.getState().currentTestName;
  process.stderr.write(`[TEST: ${name}] ${parts.join('')}\n`)
}


describe('userService.login', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


it('se connecter avec un utilisateur inexistant (erreur)', async () => {

  prisma.user.findUnique.mockResolvedValue(null);

await expect(userService.login({
  email: 'test@test.com',
  password:'testpassword'})).rejects.toMatchObject({status: 404 });



  expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com'} });
  expect(bcrypt.compare).not.toHaveBeenCalled();

  
});

it('se connecter avec un utilisateur existant', async() => {

  prisma.user.findUnique.mockResolvedValue({id: 1, email: 'exist@exist.com', password: 'hashed', isDeleted: false, });
  bcrypt.compare.mockResolvedValue(true);
  jwt.sign.mockReturnValue('fake_token');


    const result = await userService.login({
    email: 'exist@exist.com',
    password: 'existpassword'});

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email:'exist@exist.com'}});
    expect(bcrypt.compare).toHaveBeenCalledWith('existpassword', 'hashed');
    expect(result).toHaveProperty('token', 'fake_token');
    expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, expect.any(String), expect.objectContaining({ expiresIn: '1d' }));
})


it('se connecter avec un mot de passe invalide', async() => {

  prisma.user.findUnique.mockResolvedValue({ 
    id: 1, 
    email: 'nomdp@nomdp.com',
    password: 'hashed',
    isDeleted: false,
    
  });
  bcrypt.compare.mockResolvedValue(false);

  await expect(
    userService.login({ 
      email: 'nomdp@nomdp.com', 
      password: 'wrongpassword'})).rejects.toMatchObject({ status: 401, message:'Invalid credentials'});

      expect(prisma.user.findUnique).toHaveBeenCalledWith({where: {email: 'nomdp@nomdp.com'}});
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed');
      expect(jwt.sign).not.toHaveBeenCalled();

});

it('se connecter avec un compte supprimé', async() => {

  prisma.user.findUnique.mockResolvedValue({ 
    id: 1,
    email: 'deleted@test.com',
    password: 'hashed',
    isDeleted: true,
  });

  await expect(
    userService.login({ email: 'deleted@test.com', password: 'any',})
      .catch(err => {
        logErr('', err.message);
        throw err;
      })
  ).rejects.toMatchObject({ status: 403, message: 'Account has been deleted'})
  

  expect(bcrypt.compare).not.toHaveBeenCalled();
  expect(jwt.sign).not.toHaveBeenCalled();

});
});






