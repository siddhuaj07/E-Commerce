import dbConnect from '@/lib/dbConnect.js';
import User from '@/models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'POST') {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username must be a non-empty string' });
    }
    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password must be a non-empty string' });
    }
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
      console.error('Login API error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation error: ' + error.message });
      }
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
