import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//middleware for checking user info and updating req.user;
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Please log in first' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
};

// checking admin role
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
};
