import dbConnect from '@/lib/dbConnect.js';
import User from '@/models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'POST') {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    try {
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
      console.error('Signup API error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation error: ' + error.message });
      }
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
