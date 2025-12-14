import dbConnect from '@/lib/dbConnect.js';
import User from '@/models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  await dbConnect();
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    if (req.method === 'GET') {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ user });
    } else if (req.method === 'PUT') {
      const { firstName, lastName, phone, plusCode } = req.body;
      
      const updateData = {};
      if (firstName !== undefined) {
        if (typeof firstName !== 'string' || firstName.trim().length === 0) {
          return res.status(400).json({ error: 'First name must be a non-empty string' });
        }
        updateData.firstName = firstName.trim();
      }
      if (lastName !== undefined) {
        if (typeof lastName !== 'string' || lastName.trim().length === 0) {
          return res.status(400).json({ error: 'Last name must be a non-empty string' });
        }
        updateData.lastName = lastName.trim();
      }
      if (phone !== undefined) {
        if (typeof phone !== 'string' || phone.trim().length === 0) {
          return res.status(400).json({ error: 'Phone must be a non-empty string' });
        }
        updateData.phone = phone.trim();
      }
      if (plusCode !== undefined) {
        if (typeof plusCode !== 'string' || plusCode.trim().length === 0) {
          return res.status(400).json({ error: 'Plus code must be a non-empty string' });
        }
        updateData.plusCode = plusCode.trim();
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ user });
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('User profile API error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error: ' + error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
