import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
let cart = {};
export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    if (!cart[userId]) {
      cart[userId] = [];
    }
    if (req.method === 'POST') {
      cart[userId] = [];
      res.status(200).json({ message: 'Checkout successful', cart: cart[userId] });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Checkout API error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
