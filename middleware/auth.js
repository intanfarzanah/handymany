// middleware/auth.js


const jwt = require('jsonwebtoken');


// Middleware to protect routes that need authentication
const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Bearer token format
 
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify JWT
    req.user = decoded;  // Attach user info to the request object
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


module.exports = protect;
