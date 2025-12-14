import dbConnect from '@/lib/dbConnect.js';
import Product from '@/models/Product.js';
export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      // Seed mock products if collection is empty
      const existingCount = await Product.countDocuments();
      if (existingCount === 0) {
        const mockProducts = [
          {
            name: 'ROG Phone',
            description: 'Gaming smartphone with high-refresh display and performance cooling.',
            price: 59999,
            image: '/rog-phone.png',
            stock: 30,
            category: 'Electronics'
          },
          {
            name: 'ROG Laptops',
            description: 'High-performance gaming laptop with RGB and dedicated GPU.',
            price: 119999,
            image: '/rog-laptop.png',
            stock: 20,
            category: 'Electronics'
          },
          {
            name: 'ROG Backpacks',
            description: 'Durable and stylish backpack for travel and daily commute.',
            price: 2499,
            image: '/rog-backpack.png',
            stock: 100,
            category: 'Accessories'
          },
          {
            name: 'ROG Sunglasses',
            description: 'Trendy UV-protection sunglasses for everyday style.',
            price: 1499,
            image: '/rog-sunglasses.png',
            stock: 120,
            category: 'Fashion'
          },
          {
            name: 'ROG Airdopes',
            description: 'Truly wireless earbuds with immersive sound and long battery.',
            price: 1999,
            image: '/rog-airdopes.png',
            stock: 150,
            category: 'Electronics'
          },
          {
            name: 'ROG Smart Watch',
            description: 'Track fitness, heart rate, and notifications on the go.',
            price: 3499,
            image: '/rog-smartwatches.png',
            stock: 80,
            category: 'Electronics'
          },
          {
            name: 'ROG Speakers',
            description: 'Portable speakers with deep bass and 12h battery life.',
            price: 2499,
            image: '/rog-speaker.png',
            stock: 60,
            category: 'Electronics'
          },
          {
            name: 'ROG Joystick',
            description: 'Ergonomic game controller for console and PC.',
            price: 2999,
            image: '/rog-joystick.png',
            stock: 50,
            category: 'Gaming'
          }
        ];
        await Product.insertMany(mockProducts);
      }
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      console.error('Products API error:', error);
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  } else if (req.method === 'POST') {
    const { name, description, price, image, stock } = req.body;
    if (!name || !description || !price || !image || stock === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer' });
    }
    try {
      const product = new Product({ name, description, price, image, stock });
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation error: ' + error.message });
      }
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await Product.deleteMany({});
      res.status(200).json({ message: 'All products deleted successfully' });
    } catch (error) {
      console.error('Error deleting products:', error);
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
