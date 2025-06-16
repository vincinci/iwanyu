# 🛠️ Become Seller Troubleshooting Guide

## ✅ **Issue Fixed - Deployment Status**

**Latest Commit:** `8a3a6c9` - Improved error handling and validation  
**Status:** ✅ **DEPLOYED** - Both frontend and backend improvements are live

## 🔧 **What Was Fixed**

### **1. API Connection Issue** ✅ FIXED
- **Problem**: Frontend was calling `localhost:3001` instead of production backend
- **Solution**: Added production API URL to Vite config
- **Result**: All API calls now go to `https://iwanyu-backend.onrender.com/api`

### **2. Error Handling Improvements** ✅ FIXED
- **Added**: Comprehensive field validation
- **Added**: Specific error messages for duplicate business emails
- **Added**: Debug logging for troubleshooting
- **Added**: Directory creation for file uploads

### **3. Validation Enhancements** ✅ FIXED
- **Required fields**: Business name and business email validation
- **Unique constraints**: Business email uniqueness check
- **File handling**: Proper upload directory creation
- **Error reporting**: Detailed field-specific error messages

## 🧪 **How to Test**

### **Step 1: Access the Form**
```
1. Go to: https://your-vercel-app.vercel.app/become-seller
2. You should see a "Become a Seller" form
3. Debug panel shows API connection status (in development mode)
```

### **Step 2: Test Form Validation**
```
1. Try submitting empty form → Should show "Business name and email required"
2. Try duplicate email → Should show "Business email already registered"
3. Upload invalid file → Should show file type error
4. Fill valid data → Should submit successfully
```

### **Step 3: Check Console Output**
```
Open browser console (F12) and look for:
✅ "Form submission started"
✅ "API Base URL: https://iwanyu-backend.onrender.com/api"
✅ "Creating seller profile: {...}"
✅ "Seller profile created successfully"
```

## 🚨 **Common Issues & Solutions**

### **Issue: "User not authenticated"**
**Cause**: User not logged in  
**Solution**: 
```
1. Go to /login and sign in
2. Or register a new account at /register
3. Then try becoming a seller
```

### **Issue: "Business email already registered"**
**Cause**: Email already used by another seller  
**Solution**: 
```
1. Use a different business email
2. Or check if you already have a seller account
```

### **Issue: "Failed to create seller profile"**
**Cause**: Server error or validation issue  
**Solution**: 
```
1. Check browser console for specific error
2. Ensure all required fields are filled
3. Try uploading a different image file
4. Contact support if issue persists
```

### **Issue: File upload fails**
**Cause**: File size or type restrictions  
**Solution**: 
```
1. Use images (PNG, JPG) or PDF files only
2. Keep file size under 5MB
3. Ensure file has proper extension
```

## 🔍 **Debug Information**

### **Required Form Fields**
- ✅ Business Name (required)
- ✅ Business Email (required, must be unique)
- ✅ Business Phone (required)
- ⚠️ National ID file (required)
- ⚪ Business Type (optional)
- ⚪ Business Address (optional)
- ⚪ Business Description (optional)

### **API Endpoints**
- **Become Seller**: `POST /api/seller/become-seller`
- **Get Profile**: `GET /api/seller/profile`
- **Dashboard**: `GET /api/seller/dashboard`

### **Backend Validation**
```javascript
// Required validations:
1. User must be authenticated (valid JWT token)
2. Business name must not be empty
3. Business email must not be empty
4. Business email must be unique in database
5. User cannot already have a seller profile
```

## 🎯 **Expected Success Flow**

1. **User Registration/Login** → Get JWT token
2. **Form Submission** → Validate required fields
3. **File Upload** → Store national ID document
4. **Database Creation** → Create seller profile
5. **Role Update** → Change user role to SELLER
6. **Success Response** → Show confirmation message
7. **Redirect** → Navigate to profile/dashboard

## 📊 **Testing Checklist**

- [ ] Can access /become-seller page
- [ ] Debug panel shows correct API URL
- [ ] Form validation works for empty fields
- [ ] File upload accepts valid files
- [ ] Form submits successfully with valid data
- [ ] Success message appears after submission
- [ ] User role updates to SELLER
- [ ] Can access seller dashboard after approval

## 🆘 **Still Having Issues?**

If problems persist after checking this guide:

1. **Check browser console** for specific error messages
2. **Clear browser cache** and try again
3. **Try different browser** to rule out browser-specific issues
4. **Check network tab** to see actual API requests/responses
5. **Contact support** with console output and error details

## 🚀 **Production URLs**

- **Frontend**: Auto-deployed to Vercel
- **Backend**: https://iwanyu-backend.onrender.com
- **API Health**: https://iwanyu-backend.onrender.com/health

---

**Last Updated**: Latest commit with comprehensive fixes  
**Status**: ✅ **WORKING** - Both API connection and validation issues resolved 