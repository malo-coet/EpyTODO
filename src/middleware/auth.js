const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error verifying authentication token:', err);
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    req.user = decoded;
    next();
  });
}

module.exports = {
  authenticateToken,
};