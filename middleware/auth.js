const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    console.error('No token provided in headers:', req.headers);
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ message: "Invalid token" });
    }
     // Handle both 'id' and '_id' in token
    const userId = decoded._id || decoded.id;
    if (!userId) {
      console.error('Token missing user identifier:', decoded);
      return res.status(403).json({ message: "Malformed token payload" });
    }
    

    
    // Standardize the user object structure
    req.user = {
      _id: userId,
      id: userId, // Include both for compatibility
      role: decoded.role || 'user',
      ...decoded
    };
    
    console.log('Authenticated user:', req.user);
    next();
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      console.error('User or role missing in request');
      return res.status(403).json({ message: "Authentication required" });
    }
    
    if (req.user.role !== role) {
      console.error(`Role ${req.user.role} does not have required ${role} access`);
      return res.status(403).json({ message: "Access denied" });
    }
    
    next();
  };
};

module.exports = { verifyToken, requireRole };