import mongoose from 'mongoose';
import Product from '../models/Product.js';

async function updateROGPhone() {
  try {
    // Connect to MongoDB Atlas (same as the running app)
    await mongoose.connect('mongodb+srv://rahulraajk:rahulraajk@cluster0.8qjqj.mongodb.net/ecommerce?retryWrites=true&w=majority');
    
    // Update ROG Phone with ASUS phone image and details
    const result = await Product.updateOne(
      { name: 'ROG Phone' },
      { 
        $set: {
          name: 'ASUS ROG Phone 8 Pro',
          description: 'ASUS ROG Phone 8 Pro - Unlocked Android Gaming Smartphone with Snapdragon 8 Gen 3, 16GB RAM, 512GB Storage, 6.78" 165Hz AMOLED Display, 50MP Camera, 5500mAh Battery - Dual SIM',
          image: 'https://m.media-amazon.com/images/I/61Q8V8Q8Q8L._AC_SX679_.jpg',
          price: 89999,
          category: 'Electronics',
          stock: 15
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated ROG Phone to ASUS ROG Phone 8 Pro');
      
      // Show the updated product
      const updatedProduct = await Product.findOne({ name: 'ASUS ROG Phone 8 Pro' });
      console.log('\nUpdated Product Details:');
      console.log(`Name: ${updatedProduct.name}`);
      console.log(`Price: ₹${updatedProduct.price}`);
      console.log(`Category: ${updatedProduct.category}`);
      console.log(`Stock: ${updatedProduct.stock}`);
      console.log(`Image: ${updatedProduct.image}`);
    } else {
      console.log('❌ ROG Phone not found or no changes made');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating ROG Phone:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateROGPhone();
