# iwanyu - Rwanda's Premier Multivendor E-commerce Platform

![iwanyu Logo](https://via.placeholder.com/150x50/FBBF24/000000?text=iwanyu)

**iwanyu** is a scalable, secure, mobile-first multivendor e-commerce platform connecting local sellers in Rwanda to shoppers across the region and beyond. Built with modern technologies and inspired by AliExpress UI/UX, iwanyu features a vibrant yellow/white theme that reflects Rwanda's sunny spirit.

## 🌟 Features

### For Shoppers
- **Mobile-First Design**: Optimized shopping experience on all devices
- **Product Discovery**: Advanced search, filtering, and categorization
- **Secure Payments**: Flutterwave integration for safe transactions
- **Order Tracking**: Real-time order status updates
- **Reviews & Ratings**: Community-driven product feedback
- **Wishlist**: Save favorite products for later
- **Multiple Addresses**: Manage shipping and billing addresses

### For Vendors
- **Vendor Dashboard**: Comprehensive business management interface
- **Product Management**: Easy-to-use product listing and inventory tools
- **Order Management**: Track and process customer orders
- **Analytics**: Sales insights and performance metrics
- **Commission Tracking**: Transparent earnings and payout system
- **Multi-category Support**: Sell across various product categories

### For Administrators
- **Admin Dashboard**: Platform-wide management and oversight
- **Vendor Approval**: Verify and approve new sellers
- **Content Management**: Manage categories, featured products
- **Payment Management**: Oversee transactions and payouts
- **Analytics & Reporting**: Platform performance insights

## 🚀 Technology Stack

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling framework
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful SVG icons
- **Zustand**: Lightweight state management
- **React Hook Form**: Performant form handling
- **Zod**: Schema validation

### Backend (Planned)
- **NestJS**: Scalable Node.js framework
- **PostgreSQL**: Robust relational database (Neon DB hosting)
- **Prisma**: Type-safe database ORM
- **JWT**: Secure authentication
- **Flutterwave**: Payment processing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Git**: Version control

## 🎨 Design System

### Color Palette
- **Primary Yellow**: `#FBBF24` (yellow-400)
- **Secondary Yellow**: `#F59E0B` (yellow-500)  
- **Accent Yellow**: `#D97706` (yellow-600)
- **White/Light**: `#FFFFFF`, `#F9FAFB`, `#F3F4F6`
- **Dark Accents**: `#1F2937`, `#374151`, `#6B7280`

### Typography
- **Primary Font**: Inter (system fallback: sans-serif)
- **Mobile-First**: Responsive typography scaling

## 📱 Mobile-First Approach

iwanyu is designed with mobile users as the primary focus:

- **Touch-Optimized**: Large touch targets and gestures
- **Fast Loading**: Optimized images and code splitting
- **Offline-Ready**: Progressive Web App capabilities (planned)
- **Responsive Design**: Seamless experience across all screen sizes

## 🛡️ Security Features

- **JWT Authentication**: Secure user sessions
- **Role-Based Access**: Granular permissions (shopper, vendor, admin)
- **Data Validation**: Client and server-side validation
- **Secure Payments**: PCI-compliant payment processing
- **HTTPS Only**: All communications encrypted

## 🏗️ Project Structure

```
iwanyu2.0/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── vendor/         # Vendor dashboard pages
│   │   ├── products/       # Product listing pages
│   │   └── categories/     # Category pages
│   ├── components/         # Reusable React components
│   │   ├── ui/            # Base UI components
│   │   └── ...            # Feature-specific components
│   ├── lib/               # Utility functions and configurations
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand state management
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── .github/               # GitHub workflows and templates
└── docs/                  # Additional documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.18.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: Latest version

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/iwanyu2.0.git
   cd iwanyu2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   JWT_SECRET=your-jwt-secret
   FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
   FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
   DATABASE_URL=your-postgresql-connection-string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📖 Usage

### For Shoppers

1. **Browse Products**: Visit the homepage to see featured products
2. **Search & Filter**: Use the search bar and filters to find specific items
3. **Add to Cart**: Click on products to view details and add to cart
4. **Checkout**: Complete your purchase with secure payment options
5. **Track Orders**: Monitor your order status in your account dashboard

### For Vendors

1. **Sign Up**: Register as a vendor during account creation
2. **Complete Profile**: Set up your business information
3. **Add Products**: List your products with photos and descriptions
4. **Manage Orders**: Process customer orders and update shipping status
5. **Track Performance**: View sales analytics in your vendor dashboard

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Test thoroughly**: Ensure all tests pass
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes clearly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Localization

iwanyu supports multiple languages:
- **English**: Default language
- **Kinyarwanda**: Local language support (planned)
- **French**: Regional language support (planned)
- **Swahili**: Regional language support (planned)

## 🚀 Roadmap

### Phase 1: Foundation (Current)
- [x] Basic project setup and architecture
- [x] Authentication system
- [x] Product catalog
- [x] Shopping cart functionality
- [x] Vendor dashboard
- [ ] Payment integration
- [ ] Order management

### Phase 2: Enhancement
- [ ] Advanced search and filtering
- [ ] Review and rating system
- [ ] Notification system
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### Phase 3: Scale
- [ ] Analytics dashboard
- [ ] Advanced vendor tools
- [ ] API for third-party integrations
- [ ] Machine learning recommendations
- [ ] International shipping

## 📞 Support

For support and questions:

- **Email**: support@iwanyu.rw
- **Documentation**: [docs.iwanyu.rw](https://docs.iwanyu.rw)
- **GitHub Issues**: [Create an issue](https://github.com/your-username/iwanyu2.0/issues)

## 🏆 Acknowledgments

- **Rwanda Development Board**: For supporting local e-commerce initiatives
- **Local Artisans**: For inspiring authentic Rwandan product showcases
- **Open Source Community**: For the amazing tools and libraries
- **AliExpress**: For UI/UX inspiration

---

**Made with ❤️ in Rwanda 🇷🇼**

*iwanyu - Connecting Local Sellers to Global Opportunities*
