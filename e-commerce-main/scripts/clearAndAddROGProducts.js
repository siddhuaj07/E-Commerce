// Script to clear existing products and add ROG products via API
// Using built-in fetch (Node.js 18+)

const ROG_PRODUCTS = [
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

async function clearAndAddROGProducts() {
  try {
    console.log('🗑️ Clearing existing products...');
    
    // Clear existing products
    const clearResponse = await fetch('http://localhost:3000/api/products', {
      method: 'DELETE'
    });
    
    if (clearResponse.ok) {
      console.log('✅ Existing products cleared');
    } else {
      console.log('⚠️ Could not clear products, continuing...');
    }
    
    console.log('📦 Adding ROG products...');
    
    // Add each ROG product
    for (let i = 0; i < ROG_PRODUCTS.length; i++) {
      const product = ROG_PRODUCTS[i];
      console.log(`Adding ${i + 1}/${ROG_PRODUCTS.length}: ${product.name}`);
      
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        console.log(`✅ Added: ${product.name}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to add ${product.name}: ${error}`);
      }
    }
    
    console.log('🎉 ROG products update completed!');
    
    // Verify the products were added
    console.log('\n🔍 Verifying products...');
    const verifyResponse = await fetch('http://localhost:3000/api/products');
    if (verifyResponse.ok) {
      const products = await verifyResponse.json();
      console.log(`📊 Total products: ${products.length}`);
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ₹${product.price.toLocaleString()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearAndAddROGProducts();
