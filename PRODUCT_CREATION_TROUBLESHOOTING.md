# Product Creation & Image Display Troubleshooting Guide

## 🔍 Quick Diagnosis

If you can't add products or images aren't displaying, follow this step-by-step guide:

### 1. Check Authentication Status
```javascript
// Open browser console on any page and run:
console.log('User:', JSON.parse(localStorage.getItem('user') || 'null'));
console.log('Token:', localStorage.getItem('token'));
```

**Expected Results:**
- User should exist with `role: "SELLER"`
- Token should be a valid JWT string

**If Missing:** Log in again or create a seller account

### 2. Check Seller Account Status
```javascript
// In browser console, check seller profile:
fetch('http://localhost:3001/api/seller/profile', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(data => console.log('Seller Profile:', data));
```

**Expected Result:** `status: "APPROVED"`

**If Not Approved:** Contact admin or wait for approval

### 3. Verify Backend Connection
```bash
# Test backend health
curl http://localhost:3001/health

# Test categories
curl http://localhost:3001/api/categories

# Test image serving
curl -I http://localhost:3001/uploads/products/
```

### 4. Check Product Creation Process

#### Frontend Console Debugging
1. Open browser console (F12)
2. Go to Add Product page
3. Fill out the form
4. Submit and watch for console logs

Look for:
- `=== PRODUCT CREATION DEBUG ===`
- Form validation errors
- API request/response logs
- Image upload logs

#### Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|--------|----------|
| "Access token required" | Not logged in | Log in as seller |
| "Seller account must be approved" | Pending approval | Wait for admin approval |
| "Product limit exceeded" | Too many products | Delete old products |
| "Please select a category" | No category selected | Choose a valid category |
| "Image file size must be less than 5MB" | Large image | Compress image |
| "Please select a valid image file" | Wrong file type | Use JPG, PNG, GIF, or WebP |

### 5. Image Display Issues

#### Check Image URLs
```javascript
// In browser console on product pages:
document.querySelectorAll('img').forEach(img => {
  console.log('Image:', img.src, img.complete ? '✅' : '❌');
});
```

#### Test Image Serving
```bash
# List uploaded images
ls -la backend/uploads/products/

# Test direct access
curl -I http://localhost:3001/uploads/products/FILENAME.jpg
```

#### Image URL Formats
- ✅ External URLs: `https://example.com/image.jpg`
- ✅ Local files: `uploads/products/product-123.jpg`
- ❌ Invalid: `C:\Users\file.jpg` (local paths)

### 6. Backend Server Issues

#### Check Server Status
```bash
# In backend directory
cd backend
npm run dev

# Should show:
# 🚀 Server running on port 3001
# 📱 Health check: http://localhost:3001/health
```

#### Common Backend Errors
- **Port 3001 in use:** Kill existing process or use different port
- **Database connection failed:** Check .env file and database
- **Upload directory missing:** Should auto-create, check permissions

### 7. Step-by-Step Product Creation Test

1. **Login as Seller**
   ```javascript
   // Check in console
   localStorage.getItem('token') // Should exist
   JSON.parse(localStorage.getItem('user')).role // Should be 'SELLER'
   ```

2. **Navigate to Add Product** (`/add-product`)

3. **Fill Required Fields**
   - Product Name: "Test Product"
   - Description: "Test description"
   - Price: 10000 (minimum)
   - Category: Select any category
   - Stock: 1
   - Image: Upload file OR paste URL

4. **Submit Form**
   - Watch browser console for debug logs
   - Check Network tab for API calls
   - Look for success/error messages

### 8. Database Verification

```bash
# Check products in database
cd backend
npx prisma studio
```

Navigate to `Product` table and verify:
- Products are being created
- Image paths are correct
- All required fields are filled

### 9. Environment Configuration

#### Frontend (.env or vite.config.ts)
```javascript
VITE_API_URL = "http://localhost:3001/api"
```

#### Backend (.env)
```bash
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret"
PORT=3001
```

### 10. Image Processing Flow

```
User Upload → Multer → File System → Database → Frontend Display
```

**Check each step:**
1. File upload works (check Network tab)
2. File saved to `backend/uploads/products/`
3. Path stored in database
4. Frontend requests image via URL
5. Backend serves static file

## 🚨 Emergency Fixes

### Reset Everything
```bash
# Clear browser storage
localStorage.clear();

# Restart backend
cd backend
npm run dev

# Restart frontend
cd frontend
npm run dev
```

### Create Test Product via API
```bash
# Get valid category ID
curl http://localhost:3001/api/categories | jq '.data.categories[0].id'

# Create test product (replace TOKEN and CATEGORY_ID)
curl -X POST http://localhost:3001/api/seller/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": 50000,
    "categoryId": "CATEGORY_ID",
    "stock": 10,
    "image": "https://via.placeholder.com/300x300"
  }'
```

## 📞 Still Having Issues?

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed API requests
3. **Check backend logs** for server errors
4. **Verify file permissions** on uploads directory
5. **Test with different browsers** to rule out caching issues

## 🔧 Debug Commands

```bash
# Test complete flow
node test-product-creation.js

# Check uploads directory
ls -la backend/uploads/products/

# Test image serving
curl -I http://localhost:3001/uploads/products/$(ls backend/uploads/products/ | head -1)

# Check database
cd backend && npx prisma studio

# View logs
cd backend && npm run dev # Watch for errors
``` 