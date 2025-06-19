# Product Creation Troubleshooting Guide

## Overview
This guide helps troubleshoot issues with adding products as a seller in the ecommerce application.

## Quick Diagnostic Steps

### Step 1: Check Authentication
1. Open browser console (F12)
2. Run: `localStorage.getItem('token')`
3. If `null`, you need to log in again
4. If present, check if it's expired by making a test API call

### Step 2: Verify Seller Status
1. Go to Seller Dashboard
2. Check if your account status is "APPROVED"
3. If not approved, wait for admin approval or contact support

### Step 3: Check Product Limit
1. Go to "Manage Products" page
2. Count your existing products
3. If you have 10 products, delete one before adding new ones

### Step 4: Verify Required Fields
Ensure all required fields are filled:
- ✅ Product Name
- ✅ Description  
- ✅ Price (greater than 0)
- ✅ Category selected
- ✅ Stock quantity (0 or greater)
- ✅ Image (upload file OR provide URL)

## Detailed Troubleshooting

### Problem: "Authentication Required" Error

**Symptoms:**
- Redirected to login page
- "User not authenticated" message
- 401 errors in network tab

**Solutions:**
1. **Clear browser cache and cookies**
   ```bash
   # In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Re-login to your account**
   - Go to `/login`
   - Use correct seller credentials
   - Ensure you're logging into a SELLER account, not regular user

3. **Check token expiration**
   ```javascript
   // In browser console
   const token = localStorage.getItem('token');
   if (token) {
     const payload = JSON.parse(atob(token.split('.')[1]));
     console.log('Token expires:', new Date(payload.exp * 1000));
     console.log('Current time:', new Date());
   }
   ```

### Problem: "Seller Account Required" or "Account Not Approved"

**Symptoms:**
- "You need to create a seller account" message
- "Your seller account must be approved" message
- Status shows PENDING/REJECTED

**Solutions:**
1. **Create seller account** (if you don't have one)
   - Go to `/become-seller`
   - Fill out all required information
   - Upload national ID document
   - Submit application

2. **Wait for approval** (if status is PENDING)
   - Check seller dashboard for status updates
   - Approval typically takes 1-3 business days
   - Contact admin if waiting longer than expected

3. **Reapply if rejected** (if status is REJECTED)
   - Check rejection reason in dashboard
   - Fix issues mentioned in rejection
   - Submit new application

### Problem: "Product Limit Reached"

**Symptoms:**
- "You've reached the maximum limit of 10 products" message
- Cannot access add product page

**Solutions:**
1. **Delete unused products**
   - Go to "Manage Products"
   - Delete products you no longer need
   - Wait a few seconds for the change to sync

2. **Upgrade account** (future feature)
   - Contact admin about premium seller plans
   - Higher limits may be available for verified sellers

### Problem: Form Validation Errors

**Symptoms:**
- Red error messages on form submission
- Required field warnings
- "Price must be greater than 0" errors

**Solutions:**
1. **Check all required fields:**
   ```
   ✅ Product Name: Not empty, descriptive
   ✅ Description: At least 10 characters
   ✅ Price: Greater than 0, numeric
   ✅ Category: Valid category selected
   ✅ Stock: 0 or greater, numeric
   ✅ Image: File uploaded OR valid URL provided
   ```

2. **Validate image requirements:**
   - **File upload:** JPG, PNG, GIF, WebP
   - **File size:** Less than 5MB
   - **Image URL:** Valid HTTP/HTTPS URL
   - **Image URL test:** Opens in new tab successfully

3. **Check numeric fields:**
   - Price: Use numbers only (e.g., 1000, not "1,000")
   - Stock: Whole numbers only (e.g., 5, not 5.5)
   - Sale Price: Optional, but if used, must be less than regular price

### Problem: Image Upload Issues

**Symptoms:**
- "Failed to read image file" error
- Image preview not showing
- Upload seems stuck

**Solutions:**
1. **Check image file:**
   - Format: JPG, PNG, GIF, or WebP
   - Size: Less than 5MB
   - Not corrupted or damaged

2. **Try different image:**
   - Use a simple JPG or PNG file
   - Reduce file size if necessary
   - Test with a small image first

3. **Use image URL instead:**
   - Upload image to free service (imgur, etc.)
   - Copy direct image URL
   - Paste in "Image URL" field

### Problem: Network/Connection Issues

**Symptoms:**
- "Failed to create product" error
- Long loading times
- Network errors in console

**Solutions:**
1. **Check backend status:**
   - Visit: `http://localhost:3001/health`
   - Should return: `{"status":"OK","message":"Ecommerce API is running"}`

2. **Verify API configuration:**
   ```javascript
   // In browser console
   console.log('API Base URL:', 'http://localhost:3001/api');
   ```

3. **Check CORS settings:**
   - Ensure frontend is running on allowed port (5173, 3000, etc.)
   - Check browser console for CORS errors

4. **Restart services:**
   ```bash
   # Stop both frontend and backend
   # Then restart:
   
   # Backend (in backend directory)
   npm run dev
   
   # Frontend (in frontend directory) 
   npm run dev
   ```

## Advanced Debugging

### Using the Debug Script

1. **Get your authentication token:**
   - Login to your seller account
   - Open browser console (F12)
   - Run: `localStorage.getItem('token')`
   - Copy the token value

2. **Run the debug script:**
   ```bash
   TOKEN=your_token_here node debug-product-creation.js
   ```

3. **Analyze the output:**
   - ✅ Green checkmarks = working correctly
   - ❌ Red X marks = issues found
   - Follow the specific guidance provided

### Manual API Testing

Test the API directly using curl:

```bash
# Replace YOUR_TOKEN with actual token
TOKEN="your_actual_token_here"

# Test seller profile
curl -X GET "http://localhost:3001/api/seller/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test product creation
curl -X POST "http://localhost:3001/api/seller/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": 1000,
    "categoryId": "cmc0yzeow000050i7y7tdzfrj",
    "stock": 5,
    "image": "https://via.placeholder.com/300x300"
  }'
```

### Browser Console Debugging

```javascript
// Check authentication
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Test API connection
fetch('http://localhost:3001/api/seller/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Check categories
fetch('http://localhost:3001/api/categories')
.then(r => r.json())
.then(data => console.log('Categories:', data.data?.categories?.length))
.catch(console.error);
```

## Common Error Messages & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "User not authenticated" | No/invalid token | Re-login to your account |
| "Seller profile not found" | Not a seller account | Create seller account first |
| "Seller account must be approved" | Status not APPROVED | Wait for admin approval |
| "Product limit exceeded" | 10 products already | Delete existing products |
| "Please select a category" | No category chosen | Select valid category |
| "Price must be greater than 0" | Invalid price | Enter positive number |
| "Please upload an image" | No image provided | Upload file or provide URL |
| "Only image files are allowed" | Wrong file type | Use JPG, PNG, GIF, or WebP |
| "Image file size must be less than 5MB" | File too large | Compress or resize image |
| "Failed to create product" | Server error | Check logs, restart services |

## Getting Help

If you're still experiencing issues:

1. **Check the browser console** for detailed error messages
2. **Run the debug script** for comprehensive diagnostics  
3. **Check backend logs** for server-side errors
4. **Verify all prerequisites** are met (authentication, approval, etc.)
5. **Try with minimal data** to isolate the issue

## System Requirements

- ✅ Backend running on port 3001
- ✅ Frontend running on port 5173 (or other allowed port)
- ✅ Database connected and migrated
- ✅ User account with SELLER role
- ✅ Seller profile with APPROVED status
- ✅ Less than 10 existing products
- ✅ Valid authentication token
- ✅ Categories available in database

## Quick Test Checklist

Before adding a product, verify:

- [ ] I can access the seller dashboard
- [ ] My seller status shows "APPROVED"
- [ ] I have fewer than 10 products
- [ ] I can see categories in the dropdown
- [ ] My authentication token is valid
- [ ] Backend health check passes
- [ ] All required fields are filled correctly
- [ ] Image file is under 5MB and correct format

---

*Last updated: December 2024* 