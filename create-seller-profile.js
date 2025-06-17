const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001/api';

async function createSellerProfile() {
  try {
    console.log('🔐 Logging in...');
    
    // Login first
    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'iwanyu.seller@iwanyu.store',
      password: 'iwanyu123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    console.log('🏪 Creating seller profile...');
    
    // Create seller profile
    const response = await axios.post(`${BACKEND_URL}/seller/become-seller`, {
      businessName: 'Iwanyu Store',
      businessEmail: 'business@iwanyu.store',
      businessPhone: '+250794306915',
      businessAddress: 'Kigali, Rwanda',
      businessDescription: 'Premium fashion and lifestyle products store',
      businessType: 'retail'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Seller profile created successfully!');
    console.log('🏪 Business Name: Iwanyu Store');
    console.log('📧 Business Email: business@iwanyu.store');
    
  } catch (error) {
    if (error.response?.data?.error?.includes('already has a seller profile')) {
      console.log('✅ Seller profile already exists!');
    } else {
      console.error('❌ Error creating seller profile:', error.response?.data || error.message);
    }
  }
}

// Run the script
createSellerProfile(); 