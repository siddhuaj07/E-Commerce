import dbConnect from '@/lib/dbConnect.js';
import Admin from '@/models/Admin.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const admin = await Admin.findById(decoded.adminId).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Admin not found or inactive' });
    }

    res.status(200).json({
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid admin ID format' });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
