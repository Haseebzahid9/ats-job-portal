const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token.
 * @param {string} userId  - The user's MongoDB ObjectId (as string)
 * @param {string} role    - The user's role
 * @returns {string}       - Signed JWT string
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
