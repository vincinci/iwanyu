import { z } from 'zod';
import { BUSINESS } from './constants';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^(\+250|250)?[0-9]{9}$/, 'Invalid Rwanda phone number')
    .optional(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  role: z.enum(['SHOPPER', 'VENDOR']).default('SHOPPER'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string()
    .regex(/^(\+250|250)?[0-9]{9}$/, 'Invalid Rwanda phone number')
    .optional(),
});

// Address schema
export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().optional(),
  country: z.string().default('Rwanda'),
  phone: z.string()
    .regex(/^(\+250|250)?[0-9]{9}$/, 'Invalid Rwanda phone number')
    .optional(),
  isDefault: z.boolean().default(false),
});

// Vendor schemas
export const vendorRegistrationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessDescription: z.string().min(10, 'Business description must be at least 10 characters').optional(),
  businessPhone: z.string()
    .regex(/^(\+250|250)?[0-9]{9}$/, 'Invalid Rwanda phone number'),
  businessAddress: z.string().min(5, 'Business address must be at least 5 characters'),
});

// Product schemas
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3, 'Product slug must be at least 3 characters').optional(),
  description: z.string().min(10, 'Product description must be at least 10 characters'),
  shortDescription: z.string().max(160, 'Short description must be less than 160 characters').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(BUSINESS.MIN_PRODUCT_PRICE, `Price must be at least RWF ${BUSINESS.MIN_PRODUCT_PRICE}`).max(BUSINESS.MAX_PRODUCT_PRICE, `Price cannot exceed RWF ${BUSINESS.MAX_PRODUCT_PRICE}`),
  salePrice: z.number().min(0, 'Sale price must be 0 or greater').optional(),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold must be 0 or greater').default(10),
  weight: z.number().min(0, 'Weight must be 0 or greater').optional(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    value: z.string().min(1, 'Variant value is required'),
    price: z.number().min(0, 'Variant price must be 0 or greater').optional(),
    stock: z.number().int().min(0, 'Variant stock must be 0 or greater').optional(),
    sku: z.string().optional(),
  })).optional(),
}).refine((data) => {
  if (data.salePrice && data.salePrice >= data.price) {
    return false;
  }
  return true;
}, {
  message: "Sale price must be less than regular price",
  path: ["salePrice"],
});

// Category schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Category slug must be at least 2 characters').optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().url('Invalid image URL').optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0, 'Order must be 0 or greater').default(0),
});

// Review schema
export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(3, 'Review title must be at least 3 characters').optional(),
  comment: z.string().min(10, 'Review comment must be at least 10 characters').optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  minPrice: z.number().min(0, 'Minimum price must be 0 or greater').optional(),
  maxPrice: z.number().min(0, 'Maximum price must be 0 or greater').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_low', 'price_high', 'rating', 'popularity']).optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(20),
}).refine((data) => {
  if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
    return false;
  }
  return true;
}, {
  message: "Minimum price must be less than maximum price",
  path: ["maxPrice"],
});

// Order schema
export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  useBillingForShipping: z.boolean().default(false),
});

// Contact schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Newsletter schema
export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
}).refine((data) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(data.file.type);
}, {
  message: 'Only JPEG, PNG, WebP, and GIF files are allowed',
  path: ['file'],
}).refine((data) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return data.file.size <= maxSize;
}, {
  message: 'File size must be less than 5MB',
  path: ['file'],
});
