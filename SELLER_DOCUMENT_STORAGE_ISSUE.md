# Seller Document Storage Issue

## 🚨 **Problem: "Document file not found on server"**

When trying to view seller verification documents in the admin dashboard, you might see the error:
```
"Document file is no longer available on server"
```

## 🔍 **Root Cause**

This happens because **cloud hosting platforms like Render.com use ephemeral storage**:

1. **Files uploaded locally** are stored in the `/uploads` directory
2. **Server redeployments** completely wipe out the file system
3. **Database records remain** but the actual files are gone
4. **This is normal behavior** for most cloud platforms (Heroku, Render, Vercel Functions, etc.)

## 📊 **Current Affected Sellers**

Based on the current database, these sellers have documents that are no longer accessible:

- **reda** (bebisdavy@gmail.com) - `national-id-1750107764345-183690245.png`
- **davynci** (davyncidavy@gmail.com) - `national-id-1749865827022-942226310.JPG`

## ✅ **Solutions**

### **Option 1: Cloud Storage Integration (Recommended)**

Integrate with a cloud storage service like:
- **AWS S3** (most popular)
- **Google Cloud Storage** 
- **Cloudinary** (good for images)
- **Azure Blob Storage**

**Benefits:**
- ✅ Files persist across deployments
- ✅ Better performance and CDN
- ✅ Automatic backups
- ✅ Better security controls

### **Option 2: Ask Sellers to Re-Submit**

For immediate resolution:
1. **Contact affected sellers** via email
2. **Ask them to re-submit** their verification documents
3. **Note**: Files will be lost again on next deployment

### **Option 3: Local Development Only**

Continue using local file storage but:
- ⚠️ **Only for development/testing**
- ⚠️ **Files will be lost on production deployments**
- ⚠️ **Not suitable for production use**

## 🛠 **Implementation Status**

### **Current Implementation**
- ✅ **Error handling improved** with detailed messages
- ✅ **Admin gets clear explanation** of the issue
- ✅ **Graceful degradation** when files are missing

### **Error Response Format**
```json
{
  "error": "Document file is no longer available on server",
  "message": "The verification document was uploaded but is no longer accessible due to server deployment. Please ask the seller to re-submit their verification document.",
  "seller": {
    "id": "seller-id",
    "businessName": "Business Name",
    "ownerName": "Owner Name",
    "email": "seller@email.com",
    "status": "APPROVED"
  },
  "documentInfo": {
    "fileName": "national-id-123.png",
    "fileType": "image/png",
    "originalPath": "uploads/national-ids/national-id-123.png",
    "uploadedApproximately": "2025-06-16T21:02:44.812Z",
    "reason": "File was uploaded but is no longer available due to server redeployment..."
  }
}
```

## 📝 **Recommended Next Steps**

1. **Immediate**: Contact affected sellers to re-submit documents
2. **Short-term**: Implement cloud storage integration (AWS S3 recommended)
3. **Long-term**: Set up automated backups and file versioning

## 🔗 **Cloud Storage Integration Guide**

For AWS S3 integration, you would need to:

1. **Install AWS SDK**: `npm install aws-sdk`
2. **Update multer configuration** to upload to S3
3. **Update file serving** to use S3 URLs
4. **Add environment variables** for AWS credentials

This ensures files persist across deployments and provides better scalability.

---

**Note**: This is a common issue in cloud deployments and the current error handling provides clear guidance to administrators on how to resolve it. 