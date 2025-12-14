import dbConnect from '../lib/dbConnect.js';
import Product from '../models/Product.js';

async function seedProducts() {
  try {
    await dbConnect();
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

    // Upsert products by name to update images/descriptions/prices if changed
    let inserted = 0;
    for (const p of mockProducts) {
      const res = await Product.updateOne({ name: p.name }, { $set: p }, { upsert: true });
      if (res.upsertedCount === 1) inserted += 1;
    }
    if (inserted > 0) {
      console.log(`Inserted ${inserted} products via upsert.`);
    } else {
      console.log('No new inserts; existing products updated if needed.');
    }
    const newCount = await Product.countDocuments();
    console.log(`Total products now: ${newCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();


