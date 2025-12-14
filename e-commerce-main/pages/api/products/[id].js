import dbConnect from '@/lib/dbConnect.js';
import Product from '@/models/Product.js';
export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (req.method === 'GET') {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error('Product detail API error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
