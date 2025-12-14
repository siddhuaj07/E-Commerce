import dbConnect from '@/lib/dbConnect.js';
import User from '@/models/User.js';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export default async function handler(req, res) {
  try {
    await dbConnect();
    if (req.method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        res.status(200).json({ 
          user: { 
            id: user._id, 
            username: user.username, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            plusCode: user.plusCode
          } 
        });
      } catch (jwtError) {
        console.error('JWT Error:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Auth/me Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
