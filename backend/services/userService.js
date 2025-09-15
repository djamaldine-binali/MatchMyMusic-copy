const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client.js');

const JWT_SECRET = process.env.JWT_SECRET;

async function register({ email, password, username }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('User already exists');
    error.status = 400;
    throw error;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, username, password: hashedPassword },
  });
  return newUser;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  
  // Vérifier que l'utilisateur n'est pas supprimé
  if (user.isDeleted) {
    const error = new Error('Account has been deleted');
    error.status = 403;
    throw error;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
  return { token };
}

async function emailExists({ email }) {
  const user = await prisma.user.findUnique({ where: { email } });
  return !!user;
}

async function getByIdPublic(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, username: true, isAdmin: true },
  });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function updateProfileData(id, { email, username, password }) {
  const dataToUpdate = {};
  if (email) dataToUpdate.email = email;
  if (username) dataToUpdate.username = username;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    dataToUpdate.password = hashedPassword;
  }
  return prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: { id: true, email: true, username: true, createdAt: true },
  });
}

module.exports = {
  register,
  login,
  emailExists,
  getByIdPublic,
  findById,
  updateProfileData,
}; 