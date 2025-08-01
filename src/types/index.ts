export type UserRole = 'shopper' | 'vendor' | 'admin';

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Vendor = {
  id: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  businessPhone: string;
  businessAddress: string;
  isApproved: boolean;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  commissionRate: number;
  logo?: string;
  banner?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  order: number;
};

export type Product = {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariant = {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  vendorId: string;
  quantity: number;
  price: number;
  variant?: string;
  product: Product;
};

export type Cart = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded';

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  vendorId: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
  product: Product;
};

export type Address = {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  vendorId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: Pick<User, 'name'>;
};

export type PaymentProvider = 'flutterwave';

export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  reference: string;
  metadata?: Record<string, any>;
  createdAt: Date;
};

export type VendorEarnings = {
  id: string;
  vendorId: string;
  orderId: string;
  amount: number;
  commission: number;
  payout: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
  createdAt: Date;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'order' | 'payment' | 'vendor' | 'product' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
};

export type SearchFilters = {
  query?: string;
  category?: string;
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating' | 'popularity';
  page?: number;
  limit?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type DashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts: Product[];
  salesData: {
    date: string;
    sales: number;
    orders: number;
  }[];
};

export type VendorDashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalEarnings: number;
  pendingOrders: number;
  recentOrders: Order[];
  topProducts: Product[];
  salesData: {
    date: string;
    sales: number;
    orders: number;
  }[];
};
