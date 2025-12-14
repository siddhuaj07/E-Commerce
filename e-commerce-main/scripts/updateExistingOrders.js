// Script to update existing orders with new ROG products via API
const BASE_URL = 'http://localhost:3000';

async function updateExistingOrders() {
  try {
    console.log('🔄 Updating existing orders with new ROG products...');
    
    // Get admin token
    const adminLoginResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (!adminLoginResponse.ok) {
      throw new Error('Admin login failed');
    }
    
    const adminData = await adminLoginResponse.json();
    const adminToken = adminData.token;
    console.log('✅ Admin login successful');
    
    // Get current products
    const productsResponse = await fetch(`${BASE_URL}/api/products`);
    const products = await productsResponse.json();
    console.log(`📦 Found ${products.length} current products`);
    
    // Get existing orders
    const ordersResponse = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (!ordersResponse.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const ordersData = await ordersResponse.json();
    const orders = ordersData.orders;
    console.log(`📋 Found ${orders.length} existing orders`);
    
    if (orders.length === 0) {
      console.log('✅ No orders to update');
      return;
    }
    
    // For each order, we'll create a new order with current products
    console.log('\n🔄 Creating new orders with current ROG products...');
    
    // Create a test user for new orders
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
      console.log('⚠️ User signup failed, but continuing...');
    } else {
      const userData = await signupResponse.json();
      const userToken = userData.token;
      console.log('✅ Test user created');
      
      // Create new orders with current products
      const newOrders = [
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
        }
      ];
      
      for (let i = 0; i < newOrders.length; i++) {
        const order = newOrders[i];
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
    }
    
    console.log('\n🎉 Order update process completed!');
    console.log('\n📊 You can now test the admin orders page at http://localhost:3000/admin');
    console.log('   - Old orders will show "Product Not Found" (graceful handling)');
    console.log('   - New orders will show current ROG products');
    
  } catch (error) {
    console.error('❌ Error updating orders:', error.message);
  }
}

updateExistingOrders();
