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
    if (req.method === 'GET') {
      res.status(200).json(cart[userId]);
    } else if (req.method === 'POST') {
      const { productId, quantity = 1 } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      if (quantity <= 0 || !Number.isInteger(quantity)) {
        return res.status(400).json({ error: 'Quantity must be a positive integer' });
      }
      const existingItem = cart[userId].find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart[userId].push({ productId, quantity });
      }
      res.status(200).json(cart[userId]);
    } else if (req.method === 'PUT') {
      const { productId, quantity } = req.body;
      if (!productId || quantity === undefined) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
      }
      if (quantity < 0 || !Number.isInteger(quantity)) {
        return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
      }
      const item = cart[userId].find(item => item.productId === productId);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          cart[userId] = cart[userId].filter(item => item.productId !== productId);
        }
      }
      res.status(200).json(cart[userId]);
    } else if (req.method === 'DELETE') {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      cart[userId] = cart[userId].filter(item => item.productId !== productId);
      res.status(200).json(cart[userId]);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Cart API error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
