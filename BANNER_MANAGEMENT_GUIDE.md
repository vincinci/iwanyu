# Banner Management System Guide

## Overview

The Banner Management System allows administrators to dynamically manage homepage banners without code changes. The system provides a complete admin interface for creating, editing, reordering, and managing banner content.

## Features

### Key Features
- Dynamic Banner Management: Add, edit, delete banners through admin interface
- Real-time Preview: Preview banners before publishing
- Drag and Drop Reordering: Change banner order with arrow buttons
- Active/Inactive Toggle: Control banner visibility
- Image Upload: Support for PNG, JPG, GIF up to 5MB
- Responsive Design: Works on desktop and mobile
- Live Updates: Changes reflect immediately on homepage
- Fallback System: Graceful handling of missing images

### Admin Features
- Statistics dashboard showing total, active banners, and last update
- Bulk operations (reset to defaults)
- Form validation and error handling
- Toast notifications for all actions
- Admin-only access protection

## Access

### Admin Access
1. Login as an admin user
2. Navigate to /admin (Admin Dashboard)
3. Click on "Banner Management" card
4. Or directly visit /admin/banners

### Permissions
- Only users with ADMIN role can access banner management
- Non-admin users are redirected to home page
- Unauthenticated users are redirected to login

## Usage Guide

### Adding New Banners

1. Click "Add Banner" button in the header
2. Upload Image: Click the upload area or drag and drop
   - Supported formats: PNG, JPG, GIF
   - Maximum size: 5MB
   - Recommended size: 1200x400px for best results
3. Fill Details:
   - Title: Main banner heading
   - Subtitle: Secondary text/description
   - CTA Text: Call-to-action button text (e.g., "Shop Now", "Learn More")
4. Save: Click "Add Banner" to create

### Editing Banners

1. Find Banner: Locate banner in the list
2. Click "Edit": Opens edit modal
3. Modify Fields: Change title, subtitle, CTA, or image
4. Save Changes: Click "Update Banner"

### Managing Banner Order

Move Up/Down:
- Use arrow buttons (up/down arrows) to reorder
- Changes are saved automatically
- Order determines display sequence on homepage

### Activating/Deactivating Banners

1. Toggle Status: Click "Activate" or "Deactivate" button
2. Active Banners: Show on homepage
3. Inactive Banners: Hidden from homepage but preserved in system

### Preview Functionality

1. Click "Preview": Opens full-screen preview modal
2. See Exact Appearance: Shows how banner appears on homepage
3. Check Details: View all banner information

### Bulk Operations

Reset to Defaults:
- Restores original 5 default banners
- Removes all custom banners
- Requires confirmation

## Technical Implementation

### Data Storage
- Local Storage: iwanyu_banners key stores banner data
- Real-time Sync: Changes broadcast to homepage via custom events
- Fallback System: Default banners if storage is empty

### Banner Data Structure
```typescript
interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Homepage Integration
- Home component loads banners from localStorage
- Listens for bannersUpdated events
- Filters to show only active banners
- Sorts by order field

### File Structure
```
frontend/src/
├── pages/admin/
│   └── BannerManager.tsx       # Main admin interface
├── components/
│   ├── ModernBanner.tsx        # Banner display component
│   └── AdminRoute.tsx          # Admin protection
├── pages/
│   ├── Home.tsx                # Homepage integration
│   └── AdminDashboard.tsx      # Admin navigation
└── App.tsx                     # Route configuration
```

## Default Banners

The system comes with 5 default banners:

1. New Arrivals - Latest fashion and lifestyle essentials
2. Winter Collection - Stay warm with premium outerwear  
3. Essential Style - Premium quality everyday fashion
4. Active Lifestyle - Performance gear for every adventure
5. Premium Audio - Experience superior sound quality

## Best Practices

### Image Guidelines
- Dimensions: 1200x400px recommended
- Format: PNG for graphics, JPG for photos
- Size: Under 2MB for optimal loading
- Content: Ensure text is readable on various devices

### Content Guidelines
- Title: Keep under 30 characters
- Subtitle: 50-80 characters for best display
- CTA: Action-oriented, 2-3 words ideal

### Management Tips
- Test on Mobile: Preview banners on different screen sizes
- Regular Updates: Keep content fresh and seasonal
- Performance: Limit to 5-7 active banners for optimal loading
- Backup: Note custom banner details before reset

## Troubleshooting

### Common Issues

Banner Not Showing on Homepage:
- Check if banner is active
- Verify image URL is accessible
- Clear browser cache

Upload Fails:
- Check file size (max 5MB)
- Verify file format (PNG, JPG, GIF)
- Try different browser

Changes Not Reflecting:
- Refresh homepage
- Check browser console for errors
- Verify localStorage permissions

Access Denied:
- Confirm admin role in user account
- Re-login if session expired
- Contact system administrator

### Error Messages

- "Invalid File": Wrong file format selected
- "File Too Large": Image exceeds 5MB limit
- "Validation Error": Required fields missing
- "Failed to save": Storage or permission issue

## Security

### Access Control
- Admin role verification on every request
- Route protection prevents unauthorized access
- Session validation for all operations

### Data Validation
- File type validation on upload
- Size limits enforced
- Required field validation
- XSS protection on text inputs

## Future Enhancements

### Planned Features
- Cloud Storage: Move from localStorage to database
- Advanced Editor: Rich text editor for descriptions
- Scheduling: Set banner active/inactive dates
- Analytics: Track banner click-through rates
- Templates: Pre-designed banner templates
- Bulk Upload: Multiple banner upload
- Version History: Track banner changes

### API Integration
When backend is ready:
- GET /api/admin/banners - List banners
- POST /api/admin/banners - Create banner
- PUT /api/admin/banners/:id - Update banner
- DELETE /api/admin/banners/:id - Delete banner
- POST /api/admin/banners/reorder - Update order

## Support

For technical issues or feature requests:
1. Check this documentation first
2. Review browser console for errors
3. Test in incognito/private mode
4. Contact development team with details

---

Last Updated: December 2024  
Version: 1.0.0  
Compatible: React 18+, TypeScript 4.9+ 