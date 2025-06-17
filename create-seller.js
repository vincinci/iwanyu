const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001/api';

async function createSeller() {
  try {
    console.log('Creating seller account...');
    
    const response = await axios.post(`${BACKEND_URL}/auth/register`, {
      email: 'iwanyu.seller@iwanyu.store',
      password: 'iwanyu123456',
      firstName: 'Iwanyu',
      lastName: 'Seller',
      username: 'iwanyuseller',
      role: 'seller'
    });

    console.log('✅ Seller account created successfully!');
    console.log('📧 Email: iwanyu.seller@iwanyu.store');
    console.log('🔐 Password: iwanyu123456');
    console.log('👤 Role: seller');
    
    return response.data;
  } catch (error) {
    if (error.response?.data?.error?.includes('already exists')) {
      console.log('✅ Seller account already exists!');
      console.log('📧 Email: iwanyu.seller@iwanyu.store');
      console.log('🔐 Password: iwanyu123456');
      return { message: 'Account already exists' };
    } else {
      console.error('❌ Failed to create seller:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Run the script
createSeller().catch(console.error); 