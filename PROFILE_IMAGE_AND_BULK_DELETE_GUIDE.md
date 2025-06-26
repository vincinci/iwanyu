# Profile Image and Bulk Product Delete Features Guide

This guide covers the newly implemented profile image functionality and bulk product deletion features.

## 🖼️ Profile Image Feature

### Overview
Users can now upload, update, and delete their profile pictures. The profile images are displayed throughout the application including the header navigation and profile pages.

### Implementation Details

#### Backend Implementation
- **Upload endpoint**: `POST /api/auth/profile/avatar`
- **Delete endpoint**: `DELETE /api/auth/profile/avatar`
- **File storage**: Images are stored in `uploads/profiles/` directory
- **File validation**: 
  - Only image files allowed (MIME type check)
  - Maximum file size: 5MB
  - Automatic cleanup of old images when new ones are uploaded

#### Frontend Implementation
- **Profile Settings Component**: Enhanced with image upload functionality
- **Header Component**: Updated to display profile images
- **Auth API Service**: New methods for image upload/delete
- **Image Display**: Fallback to user initials when no image is present

### Usage

#### For Users
1. **Upload Profile Image**:
   - Navigate to Profile Settings (`/profile` or via header menu)
   - Click "Upload Photo" button
   - Select an image file (JPG, GIF, PNG, max 5MB)
   - Image is automatically uploaded and displayed

2. **Remove Profile Image**:
   - In Profile Settings, click "Remove Photo" button
   - Confirm the action
   - Profile will revert to showing user initials

#### For Developers
```typescript
// Upload profile image
const response = await authApi.uploadProfileImage(file);

// Delete profile image
const response = await authApi.deleteProfileImage();
```

### API Endpoints

#### Upload Profile Image
```http
POST /api/auth/profile/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData with 'avatar' file field
```

Response:
```json
{
  "message": "Profile image uploaded successfully",
  "user": {
    "id": "user_id",
    "avatar": "uploads/profiles/profile-123456789.jpg",
    // ... other user fields
  },
  "avatarUrl": "/uploads/profiles/profile-123456789.jpg"
}
```

#### Delete Profile Image
```http
DELETE /api/auth/profile/avatar
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Profile image deleted successfully",
  "user": {
    "id": "user_id",
    "avatar": null,
    // ... other user fields
  }
}
```

## 🗑️ Bulk Product Delete Feature

### Overview
Administrators can now select multiple products and delete them in bulk from the Product Management page. This feature significantly improves efficiency when managing large product catalogs.

### Implementation Details

#### Backend Implementation
- **Bulk delete endpoint**: `DELETE /api/admin/products`
- **Request body**: Array of product IDs
- **Transaction support**: Uses Prisma's `deleteMany` for atomic operations
- **Validation**: Ensures all IDs are valid strings
- **Cache clearing**: Automatically clears product caches after deletion

#### Frontend Implementation
- **AdminProducts Component**: Enhanced with selection and bulk actions
- **Checkbox Selection**: Individual and "select all" functionality
- **Bulk Actions Bar**: Appears when products are selected
- **Confirmation Dialog**: Requires confirmation before bulk deletion

### Usage

#### For Administrators
1. **Access Product Management**:
   - Navigate to Admin Dashboard
   - Click "Product Management" or go to `/admin/products`

2. **Select Products**:
   - Use individual checkboxes to select specific products
   - Use the header checkbox to select/deselect all products on current page
   - Selected count is displayed in the bulk actions bar

3. **Bulk Delete**:
   - Click "Delete Selected" button in the bulk actions bar
   - Confirm the deletion in the popup dialog
   - Products are deleted and the list is refreshed

#### For Developers
```typescript
// Bulk delete products
const response = await adminApi.bulkDeleteProducts(productIds);
```

### API Endpoints

#### Bulk Delete Products
```http
DELETE /api/admin/products
Content-Type: application/json
Authorization: Bearer <admin_token>

Body:
{
  "productIds": ["product_id_1", "product_id_2", "product_id_3"]
}
```

Response:
```json
{
  "message": "3 product(s) deleted successfully",
  "deletedCount": 3
}
```

### UI Components

#### Selection Features
- **Individual Checkboxes**: Each product row has a checkbox
- **Select All Checkbox**: Header checkbox to select/deselect all products
- **Visual Feedback**: Selected rows are highlighted
- **Selection Counter**: Shows number of selected products

#### Bulk Actions Bar
- **Conditional Display**: Only appears when products are selected
- **Delete Button**: Initiates bulk deletion with loading state
- **Cancel Button**: Clears selection and hides the bar
- **Selection Count**: Shows how many products are selected

## 🔒 Security Considerations

### Profile Images
- **File Type Validation**: Server-side MIME type checking
- **File Size Limits**: 5MB maximum to prevent abuse
- **Authentication**: JWT token required for all operations
- **File Cleanup**: Old images are automatically deleted to prevent storage bloat
- **Path Normalization**: Prevents directory traversal attacks

### Bulk Product Deletion
- **Admin Only**: Requires ADMIN role authentication
- **Input Validation**: All product IDs validated as strings
- **Confirmation Required**: Frontend confirmation dialog prevents accidental deletion
- **Atomic Operations**: Uses database transactions for consistency

## 🎨 Styling and UX

### Profile Images
- **Responsive Design**: Images scale appropriately on different screen sizes
- **Loading States**: Visual feedback during upload/delete operations
- **Error Handling**: Clear error messages for failed operations
- **Fallback Display**: Graceful fallback to user initials

### Bulk Product Management
- **Progressive Enhancement**: Features are additive to existing functionality
- **Clear Visual Hierarchy**: Selected items are clearly distinguished
- **Accessible Controls**: Proper ARIA labels and keyboard navigation
- **Mobile Responsive**: Works well on mobile devices

## 🚀 Future Enhancements

### Profile Images
- **Image Cropping**: Allow users to crop images before upload
- **Multiple Sizes**: Generate thumbnails for different use cases
- **CDN Integration**: Store images on external CDN for better performance
- **Image Optimization**: Automatic compression and format conversion

### Bulk Operations
- **Bulk Edit**: Allow editing multiple products at once
- **Bulk Status Change**: Change active/inactive status for multiple products
- **Export Selected**: Export selected products to CSV
- **Advanced Filters**: More sophisticated filtering options for bulk operations

## 🐛 Troubleshooting

### Profile Image Issues
- **Upload Fails**: Check file size (max 5MB) and format (images only)
- **Image Not Displaying**: Verify server is serving static files from `/uploads`
- **Permission Errors**: Ensure `uploads/profiles` directory has write permissions

### Bulk Delete Issues
- **Selection Not Working**: Verify admin authentication and permissions
- **Partial Deletions**: Check server logs for individual product deletion failures
- **Performance Issues**: Consider pagination for very large selections

## 📝 Testing

### Profile Images
```bash
# Test image upload
curl -X POST http://localhost:3001/api/auth/profile/avatar \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@test-image.jpg"

# Test image deletion
curl -X DELETE http://localhost:3001/api/auth/profile/avatar \
  -H "Authorization: Bearer <token>"
```

### Bulk Product Deletion
```bash
# Test bulk deletion
curl -X DELETE http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["id1", "id2", "id3"]}'
```

## 📋 Summary

Both features have been successfully implemented with:
- ✅ Complete backend API endpoints
- ✅ Frontend UI components
- ✅ Proper authentication and authorization
- ✅ Error handling and validation
- ✅ Mobile-responsive design
- ✅ TypeScript type safety
- ✅ Production-ready code

The features are now ready for use and can be accessed through the respective UI components. 