const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('./prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

async function createSession(userId) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

async function deleteSession(token) {
  await prisma.session.delete({
    where: { token },
  });
}

async function validateSession(token) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

async function validateSessionFromRequest(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }
  
  return validateSession(token);
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  createSession,
  deleteSession,
  validateSession,
  validateSessionFromRequest,
};
