const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies['auth-token'] || req.cookies['token'];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied',
      details: 'No token provided'
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied',
        details: 'Token expired'
      });
    }
    return res.status(401).json({ 
      error: 'Access denied',
      details: 'Invalid token'
    });
  }
};

module.exports = verifyToken;