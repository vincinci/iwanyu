# Troubleshooting: Add Product Not Working

## Common Issues and Solutions

### 1. Authentication Required
**Error**: "Access token required" or "Invalid token"

**Solution**:
- Make sure you're logged in to your account
- If you're logged in but still getting this error, try logging out and logging back in
- Clear browser cache and cookies for the site

### 2. Not a Seller Account
**Error**: "Seller account required"

**Solution**:
- You need to create a seller account first
- Go to the "Become a Seller" page and fill out the seller registration form
- Provide all required business information

### 3. Seller Account Not Approved
**Error**: "Seller account must be approved"

**Solution**:
- Your seller account is pending approval from admin
- Wait for admin approval (this may take 1-3 business days)
- Check your seller status in the seller dashboard
- Contact support if it's been more than 3 business days

### 4. Product Limit Reached
**Error**: "Product limit exceeded"

**Solution**:
- Sellers can only have a maximum of 10 active products
- Delete some existing products to make room for new ones
- Or wait to add more products after upgrading your seller plan (if available)

### 5. Missing Required Information
**Error**: Various validation errors

**Solution**:
- Make sure all required fields are filled:
  - Product name (required)
  - Description (required)
  - Price (must be greater than 0)
  - Category (must be selected)
  - Stock quantity (cannot be negative)
  - Product image (upload file or provide URL)

### 6. Image Upload Issues
**Error**: "Please upload an image or provide an image URL"

**Solution**:
- Upload an image file (PNG, JPG, GIF up to 5MB)
- Or provide a valid image URL
- Make sure the image file is not corrupted
- Try a smaller image if upload fails

### 7. Category Not Available
**Error**: "Please select a category" but no categories visible

**Solution**:
- Categories might not be loaded yet - wait a moment and try again
- Refresh the page if categories don't appear
- Contact admin if no categories are available

### 8. Backend Connection Issues
**Error**: Network errors or "Failed to create product"

**Solution**:
- Check if both frontend (localhost:5173) and backend (localhost:3001) are running
- Verify environment variables are set correctly
- Check browser console for detailed error messages

## How to Verify Your Setup

1. **Check Authentication Status**:
   - You should see your name/profile in the top navigation
   - You should be able to access the seller dashboard

2. **Check Seller Status**:
   - Go to Seller Dashboard
   - Status should show "APPROVED"
   - You should see your business information

3. **Check Product Count**:
   - Go to "My Products" page
   - Count should be less than 10 products

4. **Test Add Product Flow**:
   - Go to "Add Product" page
   - Fill all required fields
   - Upload a test image
   - Submit the form
   - Check browser console for any error messages

## Getting Help

If you're still experiencing issues:

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Try adding a product and note any error messages
4. Take screenshots of the error messages
5. Contact support with the details

## Developer Debug Information

- Frontend URL: http://localhost:5173
- Backend URL: http://localhost:3001
- API Endpoint: http://localhost:3001/api/seller/products
- Required Authentication: Bearer token in Authorization header
- Required Role: SELLER with APPROVED status 