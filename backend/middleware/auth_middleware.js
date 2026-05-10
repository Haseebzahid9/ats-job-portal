const jwt = require('jsonwebtoken');

/**
 * Middleware: verifyToken
 * Extracts Bearer token from Authorization header, verifies it,
 * and sets req.user = { id, role }.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = { verifyToken };
