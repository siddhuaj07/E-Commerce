// Script to update products via the API instead of direct database access
const products = [
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

console.log('📦 ROG Products to be updated:');
products.forEach((product, index) => {
  console.log(`${index + 1}. ${product.name} - ₹${product.price.toLocaleString()}`);
});

console.log('\n🔧 To update these products:');
console.log('1. Go to http://localhost:3000/admin');
console.log('2. Login with admin credentials');
console.log('3. Go to "Admin Tools" tab');
console.log('4. Click "Add New Product" for each product above');
console.log('5. Use the local images from /public folder');
console.log('\n📁 Available images in /public:');
console.log('- rog-phone.png');
console.log('- rog-laptop.png');
console.log('- rog-backpack.png');
console.log('- rog-sunglasses.png');
console.log('- rog-airdopes.png');
console.log('- rog-smartwatches.png');
console.log('- rog-speaker.png');
console.log('- rog-joystick.png');
