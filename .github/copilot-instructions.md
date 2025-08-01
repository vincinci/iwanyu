# Copilot Instructions for Iwanyu E-commerce Platform

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
Iwanyu is a scalable, secure, mobile-first multivendor e-commerce web application that connects local sellers in Rwanda to local and international shoppers. The platform is inspired by AliExpress UI/UX and features a yellow/white theme.

## Technology Stack
- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Backend**: NestJS API with PostgreSQL (Neon DB)
- **Database**: PostgreSQL hosted on Neon DB
- **Payments**: Flutterwave integration
- **Authentication**: JWT with role-based access (shopper, vendor, admin)
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Theme**: Yellow/white color scheme

## Key Features
1. **Multivendor Marketplace**: Vendor onboarding, product management, unified shopping cart
2. **Mobile-First Design**: Optimized for mobile devices with AliExpress-like UI
3. **Payment Integration**: Flutterwave for secure payments
4. **Role-Based Access**: Shopper, Vendor, Admin roles with different permissions
5. **Order Management**: Order splitting, vendor notifications, tracking

## Code Style Guidelines
- Use TypeScript for all code
- Follow Next.js 14+ App Router conventions
- Use Tailwind CSS for styling with mobile-first approach
- Implement proper error handling and validation
- Use semantic HTML and accessibility best practices
- Follow clean architecture patterns

## Key Directories
- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions, types, and configurations
- `/src/hooks` - Custom React hooks
- `/backend` - NestJS API server (separate from frontend)
- `/database` - Database schemas and migrations

## Environment Variables
Always use environment variables for sensitive data:
- Database connections
- API keys (Flutterwave, etc.)
- JWT secrets
- External service configurations

## Mobile-First Development
- Start with mobile designs (320px+)
- Use responsive breakpoints: sm, md, lg, xl
- Optimize for touch interfaces
- Ensure fast loading on mobile networks

## Color Theme
Primary colors based on yellow/white theme:
- Yellow: #FCD34D, #FBBF24, #F59E0B
- White/Light: #FFFFFF, #F9FAFB, #F3F4F6
- Dark accents: #1F2937, #374151, #6B7280
