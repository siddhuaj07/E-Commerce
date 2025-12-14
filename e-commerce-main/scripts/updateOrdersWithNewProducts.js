// Script to update existing orders with new ROG products
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import dbConnect from '../lib/dbConnect.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

async function updateOrdersWithNewProducts() {
  try {
    await dbConnect();
    console.log('🔗 Connected to database');

    // Get all current products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} current products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ${product._id}`);
    });

    // Get all orders
    const orders = await Order.find({});
    console.log(`\n📋 Found ${orders.length} orders`);

    if (orders.length === 0) {
      console.log('✅ No orders to update');
      return;
    }

    // Update each order
    let updatedCount = 0;
    for (const order of orders) {
      let orderUpdated = false;
      
      // Update each item in the order
      for (const item of order.items) {
        // Find a matching product by name or use the first product as fallback
        let newProduct = products.find(p => 
          p.name.toLowerCase().includes('phone') && item.product.toString().includes('phone') ||
          p.name.toLowerCase().includes('laptop') && item.product.toString().includes('laptop') ||
          p.name.toLowerCase().includes('backpack') && item.product.toString().includes('backpack') ||
          p.name.toLowerCase().includes('sunglasses') && item.product.toString().includes('sunglasses') ||
          p.name.toLowerCase().includes('airdopes') && item.product.toString().includes('airdopes') ||
          p.name.toLowerCase().includes('watch') && item.product.toString().includes('watch') ||
          p.name.toLowerCase().includes('speaker') && item.product.toString().includes('speaker') ||
          p.name.toLowerCase().includes('joystick') && item.product.toString().includes('joystick')
        );
        
        // If no specific match, use the first product as fallback
        if (!newProduct) {
          newProduct = products[0];
        }
        
        // Update the product reference
        if (item.product.toString() !== newProduct._id.toString()) {
          item.product = newProduct._id;
          orderUpdated = true;
        }
      }
      
      // Save the order if it was updated
      if (orderUpdated) {
        await order.save();
        updatedCount++;
        console.log(`   ✅ Updated order ${order._id}`);
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} orders with new product references`);
    
    // Verify the updates
    const updatedOrders = await Order.find({}).populate('items.product', 'name price');
    console.log('\n📋 Updated orders:');
    updatedOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order ${order._id}:`);
      order.items.forEach((item, itemIndex) => {
        console.log(`      ${itemIndex + 1}. ${item.product.name} - ₹${item.product.price} x${item.quantity}`);
      });
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating orders:', error);
    process.exit(1);
  }
}

updateOrdersWithNewProducts();
