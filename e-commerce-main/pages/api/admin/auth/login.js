import dbConnect from '@/lib/dbConnect.js';
import Admin from '@/models/Admin.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

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
    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: username },
        { email: username }
      ],
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id,
        username: admin.username,
        role: admin.role,
        type: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error: ' + error.message });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
