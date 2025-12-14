// Script to create test orders with new ROG products
const BASE_URL = 'http://localhost:3000';

async function createTestOrders() {
  try {
    console.log('🧪 Creating test orders with ROG products...');
    
    // First, get the current products
    const productsResponse = await fetch(`${BASE_URL}/api/products`);
    const products = await productsResponse.json();
    
    if (products.length === 0) {
      console.log('❌ No products found. Please ensure products are loaded first.');
      return;
    }
    
    console.log(`📦 Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ₹${product.price.toLocaleString()}`);
    });
    
    // Create a test user
    console.log('\n👤 Creating test user...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    if (!signupResponse.ok) {
      throw new Error(`Signup failed: ${signupResponse.status}`);
    }
    
    const userData = await signupResponse.json();
    const userToken = userData.token;
    console.log('✅ Test user created');
    
    // Add products to cart
    console.log('\n🛒 Adding products to cart...');
    const cartItems = [
      { productId: products[0]._id, quantity: 1 }, // ROG Phone
      { productId: products[1]._id, quantity: 1 }, // ROG Laptop
      { productId: products[2]._id, quantity: 2 }  // ROG Backpack x2
    ];
    
    for (const item of cartItems) {
      await fetch(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(item)
      });
    }
    
    console.log('✅ Products added to cart');
    
    // Create test orders
    console.log('\n📋 Creating test orders...');
    
    const testOrders = [
      {
        items: [
          { productId: products[0]._id, quantity: 1 }, // ROG Phone
          { productId: products[1]._id, quantity: 1 }  // ROG Laptop
        ],
        shippingInfo: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          plusCode: '57FC+4XH'
        }
      },
      {
        items: [
          { productId: products[2]._id, quantity: 2 }, // ROG Backpack x2
          { productId: products[3]._id, quantity: 1 }  // ROG Sunglasses
        ],
        shippingInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '0987654321',
          plusCode: '8F6C+2XH'
        }
      },
      {
        items: [
          { productId: products[4]._id, quantity: 1 }, // ROG Airdopes
          { productId: products[5]._id, quantity: 1 }, // ROG Watch
          { productId: products[6]._id, quantity: 1 }  // ROG Speaker
        ],
        shippingInfo: {
          firstName: 'Bob',
          lastName: 'Johnson',
          phone: '5555555555',
          plusCode: '9G7D+3YI'
        }
      }
    ];
    
    for (let i = 0; i < testOrders.length; i++) {
      const order = testOrders[i];
      console.log(`   Creating order ${i + 1}...`);
      
      const orderResponse = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(order)
      });
      
      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        console.log(`   ✅ Order ${i + 1} created: ${orderData.order._id}`);
      } else {
        console.log(`   ❌ Order ${i + 1} failed: ${orderResponse.status}`);
      }
    }
    
    console.log('\n🎉 Test orders created successfully!');
    console.log('\n📊 You can now test the admin orders page at http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error.message);
  }
}

createTestOrders();
