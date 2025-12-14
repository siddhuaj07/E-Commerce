// Comprehensive test script for all e-commerce features
const BASE_URL = 'http://localhost:3000';

async function testFeature(name, testFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await testFn();
    console.log(`✅ ${name}: PASSED`);
  } catch (error) {
    console.log(`❌ ${name}: FAILED - ${error.message}`);
  }
}

async function testProductsAPI() {
  const response = await fetch(`${BASE_URL}/api/products`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const products = await response.json();
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('No products returned');
  }
  
  console.log(`   📦 Found ${products.length} products`);
  products.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.name} - ₹${product.price.toLocaleString()}`);
  });
}

async function testUserSignup() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
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
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  if (!data.token) throw new Error('No token returned');
  
  console.log(`   👤 User created with token: ${data.token.substring(0, 20)}...`);
  return data.token;
}

async function testUserLogin() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser',
      password: 'password123'
    })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  if (!data.token) throw new Error('No token returned');
  
  console.log(`   🔑 Login successful with token: ${data.token.substring(0, 20)}...`);
  return data.token;
}

async function testCartAPI(token) {
  // Test GET cart
  const getResponse = await fetch(`${BASE_URL}/api/cart`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!getResponse.ok) throw new Error(`GET cart failed: HTTP ${getResponse.status}`);
  
  const cart = await getResponse.json();
  console.log(`   🛒 Cart has ${cart.length} items`);
  
  // Test POST to cart
  const postResponse = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      productId: '68d0182c07cf5b9fb5b72a23', // ROG Phone ID
      quantity: 1
    })
  });
  
  if (!postResponse.ok) throw new Error(`POST to cart failed: HTTP ${postResponse.status}`);
  
  const updatedCart = await postResponse.json();
  console.log(`   🛒 Cart updated, now has ${updatedCart.length} items`);
}

async function testAdminLogin() {
  const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  if (!data.token) throw new Error('No token returned');
  
  console.log(`   🔑 Admin login successful with token: ${data.token.substring(0, 20)}...`);
  return data.token;
}

async function testAdminProductsAPI(token) {
  const response = await fetch(`${BASE_URL}/api/admin/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  if (!data.products || !Array.isArray(data.products)) {
    throw new Error('Invalid products response');
  }
  
  console.log(`   📦 Admin can access ${data.products.length} products`);
}

async function testHomepage() {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const html = await response.text();
  if (!html.includes('E-Commerce Store')) {
    throw new Error('Homepage content not found');
  }
  
  console.log(`   🏠 Homepage loads successfully`);
}

async function testAdminPage() {
  const response = await fetch(`${BASE_URL}/admin`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const html = await response.text();
  if (!html.includes('Admin Dashboard')) {
    throw new Error('Admin page content not found');
  }
  
  console.log(`   🔧 Admin page loads successfully`);
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive E-Commerce Feature Tests\n');
  
  // Test basic APIs
  await testFeature('Products API', testProductsAPI);
  await testFeature('Homepage', testHomepage);
  await testFeature('Admin Page', testAdminPage);
  
  // Test user features
  const userToken = await testFeature('User Signup', testUserSignup);
  if (userToken) {
    await testFeature('User Login', testUserLogin);
    await testFeature('Cart API', () => testCartAPI(userToken));
  }
  
  // Test admin features
  const adminToken = await testFeature('Admin Login', testAdminLogin);
  if (adminToken) {
    await testFeature('Admin Products API', () => testAdminProductsAPI(adminToken));
  }
  
  console.log('\n🎉 All tests completed!');
}

runAllTests().catch(console.error);
