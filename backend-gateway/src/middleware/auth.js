const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ews_jwt_super_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For local demo flexibility, attach mock guest admin if token omitted
    req.user = { id: 'usr-guest', name: 'Duty Officer NDRF', role: 'DISTRICT_ADMIN', district: 'Uttarkashi' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `Role ${req.user ? req.user.role : 'GUEST'} is not authorized for this operation.`
      });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET };
