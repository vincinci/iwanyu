const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:3001/api';

// Login as seller to get auth token
async function login() {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'iwanyu.seller@iwanyu.store',
      password: 'iwanyu123456'
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Import products using the existing endpoint
async function importProducts(token, csvFilePath) {
  try {
    const form = new FormData();
    form.append('csvFile', fs.createReadStream(csvFilePath));

    const response = await axios.post(`${BACKEND_URL}/seller/products/import`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      timeout: 300000 // 5 minutes timeout for large imports
    });

    return response.data;
  } catch (error) {
    console.error('Import failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main import function
async function main() {
  try {
    console.log('🚀 Starting Iwanyu product import...');
    
    // Login to get auth token
    console.log('📝 Logging in...');
    const token = await login();
    console.log('✅ Login successful');

    // Import products
    console.log('📦 Importing products from CSV...');
    const csvPath = './frontend/iwanyu-products-import.csv';
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }

    const result = await importProducts(token, csvPath);
    
    console.log('🎉 Import completed successfully!');
    console.log('📊 Import Results:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
main(); 