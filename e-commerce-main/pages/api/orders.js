import dbConnect from '@/lib/dbConnect.js';
import Order from '@/models/Order.js';
import Product from '@/models/Product.js';
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
      const orders = await Order.find({ user: userId })
        .populate('items.product', 'name image price category')
        .sort({ createdAt: -1 });
      res.status(200).json({ orders });
    } else if (req.method === 'POST') {
      const { items, shippingInfo } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items are required' });
      }
      if (!shippingInfo) {
        return res.status(400).json({ error: 'Shipping information is required' });
      }
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.phone || !shippingInfo.plusCode) {
        return res.status(400).json({ error: 'All shipping fields are required' });
      }
      let totalAmount = 0;
      const orderItems = [];
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        orderItems.push({ product: product._id, quantity: item.quantity, price: product.price });
      }
      const order = new Order({ user: userId, items: orderItems, totalAmount, shippingInfo });
      await order.save();
      await order.populate('items.product', 'name image price category');
      res.status(201).json({ order });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Orders API error:', error);
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
