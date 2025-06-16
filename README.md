# Ecommerce Store

A full-stack ecommerce application built with React, Node.js, Express, Prisma, and PostgreSQL.

## Features

- 🛒 Product catalog with categories
- 🔐 User authentication (register/login)
- 🛍️ Shopping cart functionality
- 📱 Responsive design with Tailwind CSS
- ✨ Beautiful animations with Framer Motion
- 🎨 Yellow and white color scheme
- 🔒 JWT-based authentication
- 📊 PostgreSQL database with Prisma ORM

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Neon DB)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Query
- Lucide React Icons

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-store
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Environment Setup

1. Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://iwanyu.store_owner:npg_hlx5dziPHa3p@ep-round-river-a895x0oc-pooler.eastus2.azure.neon.tech/iwanyu.store?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

2. Generate Prisma client and sync database:
```bash
cd backend
npm run db:generate
npm run db:push
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:3001

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Categories
- `GET /api/categories` - Get all categories

### Cart (Coming Soon)
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item

### Orders (Coming Soon)
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order

## Database Schema

The application uses the following main models:
- User
- Product
- Category
- CartItem
- Order
- OrderItem
- Address
- Review

## Development

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Features

#### Product Management
- **Image Upload**: Sellers can now upload product images directly or provide URLs
  - Supports drag-and-drop file upload
  - Real-time image preview
  - File validation (images only, 5MB limit)
  - Automatic image storage in `backend/uploads/products/`
  - Toggle between file upload and URL input
  - Accessible with proper ARIA labels

#### Image Upload Implementation
- **Backend**: Uses multer middleware for file handling
- **Frontend**: React-based drag-and-drop interface with preview
- **Storage**: Files stored in `uploads/products/` directory
- **Access**: Images served statically via `/uploads` endpoint
- **Validation**: File type (images only) and size (5MB) validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License. 

## Troubleshooting

### Common Issues

#### "Seller profile not found" Error
If you encounter this error when accessing the seller dashboard:

1. **Check your account role**: Only users with SELLER role can access the seller dashboard
2. **Create seller profile**: Visit `/become-seller` to create a seller profile
3. **Wait for approval**: Seller profiles need admin approval before full access
4. **Use test account**: Use the test seller account provided in `ADMIN_CREDENTIALS.md`

**Test Seller Account:**
- Email: `testseller@iwanyu.store`
- Password: `TestSeller@123`

#### "Cannot read properties of undefined (reading 'getAuthHeaders')" Error
This error was caused by a JavaScript context binding issue in the seller API service. **This has been fixed** by converting class methods to arrow functions to preserve the `this` context when called from React Query.

If you still encounter this error:
1. **Refresh the page**: Clear any cached JavaScript
2. **Check console**: Look for additional error details
3. **Restart development server**: `npm run dev` in the frontend directory

#### "Cannot read properties of undefined (reading 'categories')" Error
This error was caused by incorrect API data access patterns. **This has been fixed** by updating the data access patterns to match the actual API response structures:

- **Categories API**: Use `categoriesData?.categories` (not `categoriesData?.data.categories`)
- **Products API**: Use `productsData?.data.products` (correct)
- **Orders API**: Use `data.data.id` for order creation responses (correct)

Fixed components: `AddProduct.tsx`, `Categories.tsx`, `Products.tsx`

#### Admin/Seller Navigation
- Admin pages (`/admin/*`) don't show the main navigation bar
- Seller pages (`/seller/*`) don't show the main navigation bar  
- Customer pages show full navigation with header and footer

### Development

#### Backend Setup 