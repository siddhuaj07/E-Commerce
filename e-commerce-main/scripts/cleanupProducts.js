import dbConnect from '../lib/dbConnect.js';
import Product from '../models/Product.js';

async function cleanupProducts() {
  try {
    await dbConnect();
    
    // Normalize Boat Airdopes naming/image
    await Product.updateMany(
      { name: { $regex: /(boAt Airdopes|boat airdopes|Boat Airdopes)/i } },
      { $set: {
        name: 'Boat Airdopes',
        image: 'https://images.unsplash.com/photo-1606229364791-5e8e79fba399?q=80&w=1200&auto=format&fit=crop'
      } }
    );
    
    // Define the 8 products we want to keep
    const keepProducts = [
      'ROG Phone',
      'ROG Laptops', 
      'Skybags Backpacks',
      'Fastrack Sunglasses',
      'Boat Airdopes',
      'Smart Watch',
      'Bluetooth Speakers',
      'Joystick'
    ];
    
    // Delete all products that are NOT in our keep list
    const result = await Product.deleteMany({ 
      name: { $nin: keepProducts } 
    });
    
    console.log(`Deleted ${result.deletedCount} old products.`);
    
    // Show remaining products
    const remaining = await Product.find({}).select('name price');
    console.log(`Remaining products (${remaining.length}):`);
    remaining.forEach(p => {
      console.log(`- ${p.name}: ₹${p.price}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up products:', error);
    process.exit(1);
  }
}

cleanupProducts();
