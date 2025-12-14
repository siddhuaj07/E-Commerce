import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import dbConnect from '../lib/dbConnect.js';
import Product from '../models/Product.js';

async function updateAllProductsWithROGImages() {
  try {
    await dbConnect();
    console.log('Connected to database');

    // Define the ROG products with their corresponding local images
    const rogProducts = [
      {
        name: 'ROG Phone 8 Pro',
        description: 'Ultimate gaming smartphone with Snapdragon 8 Gen 3, 165Hz AMOLED display, and advanced cooling system.',
        price: 89999,
        image: '/rog-phone.png',
        stock: 25,
        category: 'Electronics'
      },
      {
        name: 'ROG Strix G16 Gaming Laptop',
        description: 'High-performance gaming laptop with Intel i7, RTX 4060, 16GB RAM, and RGB keyboard.',
        price: 129999,
        image: '/rog-laptop.png',
        stock: 15,
        category: 'Electronics'
      },
      {
        name: 'ROG Ranger BP3701 Backpack',
        description: 'Premium gaming backpack with dedicated laptop compartment, RGB lighting, and ergonomic design.',
        price: 3999,
        image: '/rog-backpack.png',
        stock: 50,
        category: 'Accessories'
      },
      {
        name: 'ROG Gaming Sunglasses',
        description: 'Blue light filtering gaming sunglasses with UV protection and anti-glare coating.',
        price: 2499,
        image: '/rog-sunglasses.png',
        stock: 75,
        category: 'Fashion'
      },
      {
        name: 'ROG Cetra True Wireless Earbuds',
        description: 'Gaming earbuds with low latency, active noise cancellation, and 30-hour battery life.',
        price: 8999,
        image: '/rog-airdopes.png',
        stock: 100,
        category: 'Electronics'
      },
      {
        name: 'ROG Watch 3 Pro',
        description: 'Smartwatch with health monitoring, GPS, 14-day battery life, and gaming mode.',
        price: 19999,
        image: '/rog-smartwatches.png',
        stock: 40,
        category: 'Electronics'
      },
      {
        name: 'ROG Strix Go 2.4 Wireless Speaker',
        description: 'Portable gaming speaker with 2.4GHz wireless connection, RGB lighting, and 12-hour battery.',
        price: 12999,
        image: '/rog-speaker.png',
        stock: 30,
        category: 'Electronics'
      },
      {
        name: 'ROG Raikiri Pro Controller',
        description: 'Professional gaming controller with Hall effect triggers, customizable buttons, and RGB lighting.',
        price: 15999,
        image: '/rog-joystick.png',
        stock: 35,
        category: 'Gaming'
      }
    ];

    console.log('Updating products with ROG images and names...');

    // First, delete all existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing products`);

    // Insert new ROG products
    const insertResult = await Product.insertMany(rogProducts);
    console.log(`Inserted ${insertResult.length} new ROG products`);

    // Display the updated products
    const allProducts = await Product.find({});
    console.log('\n📦 Updated Products:');
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Price: ₹${product.price.toLocaleString()}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Image: ${product.image}`);
      console.log('');
    });

    console.log('✅ All products updated successfully with ROG branding and local images!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  }
}

updateAllProductsWithROGImages();
