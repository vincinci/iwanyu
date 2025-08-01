#!/usr/bin/env node

const API_BASE = 'http://localhost:3002/api';

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`\n✅ ${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.log(`\n❌ ${method} ${endpoint}`);
    console.log('Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing iWanyu 2.0 APIs\n');
  console.log('='.repeat(50));
  
  // Test Categories API
  console.log('\n📂 Testing Categories API');
  await testAPI('/categories');
  
  // Test Products API
  console.log('\n📦 Testing Products API');
  await testAPI('/products');
  await testAPI('/products?featured=true');
  
  // Test Authentication
  console.log('\n🔐 Testing Authentication API');
  const loginResult = await testAPI('/auth/login', 'POST', {
    email: 'customer@iwanyu.rw',
    password: 'customer123'
  });
  
  if (loginResult && loginResult.success) {
    console.log('\n✅ Login successful! Token received.');
    
    // Test authenticated routes
    const token = loginResult.token;
    
    // Test cart (requires auth)
    console.log('\n🛒 Testing Cart API (authenticated)');
    const cartResponse = await fetch(`${API_BASE}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const cartResult = await cartResponse.json();
    console.log('Cart response:', JSON.stringify(cartResult, null, 2));
    
    // Test orders (requires auth)
    console.log('\n📋 Testing Orders API (authenticated)');
    const ordersResponse = await fetch(`${API_BASE}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const ordersResult = await ordersResponse.json();
    console.log('Orders response:', JSON.stringify(ordersResult, null, 2));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 API Testing Complete!');
  console.log('\n🌐 Frontend available at: http://localhost:3002');
  console.log('📋 Test accounts:');
  console.log('   Customer: customer@iwanyu.rw / customer123');
  console.log('   Vendor: vendor@iwanyu.rw / vendor123');
  console.log('   Admin: admin@iwanyu.rw / admin123');
}

runTests().catch(console.error);
