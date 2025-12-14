import dbConnect from '@/lib/dbConnect.js';
import Order from '@/models/Order.js';
import User from '@/models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if it's a user token (user tokens don't have type field, admin tokens have type: 'admin')
    if (decoded.type === 'admin') {
      return res.status(401).json({ error: 'Admin tokens not allowed for user operations' });
    }
    
    // Ensure it has userId (user tokens have userId, admin tokens have adminId)
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token - user ID not found' });
    }

    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    if (typeof orderId !== 'string' || orderId.trim().length === 0) {
      return res.status(400).json({ error: 'Order ID must be a non-empty string' });
    }

    // Find the order and verify it belongs to the user
    const order = await Order.findOne({ 
      _id: orderId, 
      user: decoded.userId 
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or does not belong to you' });
    }

    // Check if order can be cancelled (only if status is 'order_placed')
    if (order.status !== 'order_placed') {
      return res.status(400).json({ 
        error: 'Order cannot be cancelled. Only orders with "Order Placed" status can be cancelled.' 
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ 
      message: 'Order cancelled successfully', 
      order 
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error: ' + error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    res.status(500).json({ error: 'Server error during order cancellation: ' + error.message });
  }
}
