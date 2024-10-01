const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secretkeyappearshere';
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token:', token);

  if (!token){
    return res.status(401).json({ message: 'Token required for authorization'});
  }

  jwt.verify(token, JWT_SECRET, (err, user)=> {
    if (err){
      console.error('Token verification error:', err);
      return res.status(403).json({message: 'Invalid or expired token'});
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;