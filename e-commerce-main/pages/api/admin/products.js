import dbConnect from '@/lib/dbConnect.js';
import Product from '@/models/Product.js';
import jwt from 'jsonwebtoken';
export default async function handler(req, res) {
  await dbConnect();
  // Increase body size for this route to allow base64 images up to ~10mb
  // Next.js (pages) allows per-route config by exporting config below
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (req.method === 'GET') {
    try {
      const products = await Product.find({});
      res.status(200).json({ products });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products: ' + error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description, price, image, category, stock } = req.body;
      if (!name || !description || !price || !image || !category || stock === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
      }
      if (typeof description !== 'string' || description.trim().length === 0) {
        return res.status(400).json({ error: 'Description must be a non-empty string' });
      }
      if (typeof image !== 'string' || image.trim().length === 0) {
        return res.status(400).json({ error: 'Image must be a non-empty string' });
      }
      if (typeof category !== 'string' || category.trim().length === 0) {
        return res.status(400).json({ error: 'Category must be a non-empty string' });
      }
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer' });
      }
      const product = new Product({ name, description, price: parseFloat(price), image, category, stock: parseInt(stock) });
      await product.save();
      res.status(201).json({ product, message: 'Product created successfully' });
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation error: ' + error.message });
      }
      res.status(500).json({ error: 'Failed to create product: ' + error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { productId, name, description, price, image, category, stock } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      if (typeof productId !== 'string' || productId.trim().length === 0) {
        return res.status(400).json({ error: 'Product ID must be a non-empty string' });
      }
      if (!name || !description || !price || !image || !category || stock === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
      }
      if (typeof description !== 'string' || description.trim().length === 0) {
        return res.status(400).json({ error: 'Description must be a non-empty string' });
      }
      if (typeof image !== 'string' || image.trim().length === 0) {
        return res.status(400).json({ error: 'Image must be a non-empty string' });
      }
      if (typeof category !== 'string' || category.trim().length === 0) {
        return res.status(400).json({ error: 'Category must be a non-empty string' });
      }
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer' });
      }
      
      const product = await Product.findByIdAndUpdate(
        productId,
        { name, description, price: parseFloat(price), image, category, stock: parseInt(stock) },
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.status(200).json({ product, message: 'Product updated successfully' });
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation error: ' + error.message });
      }
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      res.status(500).json({ error: 'Failed to update product: ' + error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      if (typeof productId !== 'string' || productId.trim().length === 0) {
        return res.status(400).json({ error: 'Product ID must be a non-empty string' });
      }
      
      const product = await Product.findByIdAndDelete(productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      res.status(500).json({ error: 'Failed to delete product: ' + error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

// Per-route config to raise body size limit (useful for base64 image payloads)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
