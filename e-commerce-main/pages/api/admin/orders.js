import dbConnect from '@/lib/dbConnect.js';
import Order from '@/models/Order.js';
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
    if (decoded.type !== 'admin') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    if (req.method === 'GET') {
      const orders = await Order.find({})
        .populate('user', 'username email firstName lastName')
        .populate({
          path: 'items.product',
          select: 'name image price category',
          // Handle missing products gracefully
          options: { strictPopulate: false }
        })
        .sort({ createdAt: -1 });
      
      // Process orders to handle missing products
      const processedOrders = orders.map(order => ({
        ...order.toObject(),
        items: order.items.map(item => ({
          ...item,
          product: item.product || {
            _id: item.product,
            name: 'Product Not Found',
            image: '/placeholder-product.svg',
            price: 0,
            category: 'Unknown'
          }
        }))
      }));
      
      res.status(200).json({ orders: processedOrders });
    } else if (req.method === 'PUT') {
      const { orderId, status } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ error: 'Order ID and status are required' });
      }
      if (typeof orderId !== 'string' || orderId.trim().length === 0) {
        return res.status(400).json({ error: 'Order ID must be a non-empty string' });
      }
      if (typeof status !== 'string' || status.trim().length === 0) {
        return res.status(400).json({ error: 'Status must be a non-empty string' });
      }
      const validStatuses = ['order_placed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true })
        .populate('user', 'username email firstName lastName')
        .populate({
          path: 'items.product',
          select: 'name image price category',
          options: { strictPopulate: false }
        });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Process order to handle missing products
      const processedOrder = {
        ...order.toObject(),
        items: order.items.map(item => ({
          ...item,
          product: item.product || {
            _id: item.product,
            name: 'Product Not Found',
            image: '/placeholder-product.svg',
            price: 0,
            category: 'Unknown'
          }
        }))
      };
      
      res.status(200).json({ order: processedOrder });
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Admin orders API error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error: ' + error.message });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
