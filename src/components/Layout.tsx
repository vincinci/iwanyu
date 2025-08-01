'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore, useCartStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { SearchBar } from './SearchBar';
import { CartDrawer } from './CartDrawer';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { cart, toggleCart } = useCartStore();
  const { isMobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUIStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Vendors', href: '/vendors' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header className={cn('bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50', className)}>
        {/* Top bar - Simplified */}
        <div className="bg-gray-900 text-white py-1">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-xs">
              <p>🇷🇼 Rwanda&apos;s Premier Online Marketplace</p>
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/help" className="hover:text-yellow-400 transition-colors">Help</Link>
                <span className="text-gray-400">|</span>
                <Link href="/track-order" className="hover:text-yellow-400 transition-colors">Track Order</Link>
                <span className="text-gray-400">|</span>
                <Link href="/sell" className="hover:text-yellow-400 transition-colors font-medium">Sell on iwanyu</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold text-xl">i</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">iwanyu</span>
              </Link>
            </div>

            {/* Search Bar - Desktop (Prominent like AliExpress) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="w-full relative">
                <SearchBar />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Search - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-gray-600 hover:text-gray-900"
                onClick={() => setIsSearchOpen(true)}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </Button>

              {/* Favorites */}
              {isAuthenticated && (
                <Link href="/favorites">
                  <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900">
                    <HeartIcon className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-600 hover:text-gray-900"
                onClick={toggleCart}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.itemCount}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <UserMenu user={user!} />
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-black hover:bg-gray-800 text-white border-black">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation - AliExpress Style */}
        <div className="hidden lg:block border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-8 h-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-yellow-600 py-3',
                    isActive(item.href)
                      ? 'text-yellow-600 border-b-2 border-yellow-600'
                      : 'text-gray-700'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex-1"></div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <Link href="/deals" className="hover:text-yellow-600 transition-colors">
                  🔥 Today's Deals
                </Link>
                <Link href="/new-arrivals" className="hover:text-yellow-600 transition-colors">
                  ✨ New Arrivals
                </Link>
                <Link href="/bestsellers" className="hover:text-yellow-600 transition-colors">
                  ⭐ Best Sellers
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile search */}
              <SearchBar />
              
              {/* Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block py-2 text-base font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-yellow-600'
                        : 'text-gray-700 hover:text-yellow-600'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Auth buttons for mobile */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link href="/auth/login" className="block">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile search overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Search Products</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>
            </div>
            <SearchBar onSearch={() => setIsSearchOpen(false)} />
          </div>
        </div>
      )}

      <CartDrawer />
    </>
  );
}

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'iwanyu',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'For Sellers',
      links: [
        { name: 'Start Selling', href: '/sell' },
        { name: 'Seller Center', href: '/seller/dashboard' },
        { name: 'Seller University', href: '/seller/university' },
        { name: 'Fees & Pricing', href: '/seller/fees' },
      ],
    },
    {
      title: 'Customer Care',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Track Your Order', href: '/track-order' },
        { name: 'Returns & Refunds', href: '/returns' },
        { name: 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Intellectual Property', href: '/ip' },
      ],
    },
  ];

  return (
    <footer className={cn('bg-gray-900 text-white', className)}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold">iwanyu</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {currentYear} iwanyu. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Made with ❤️ in Rwanda 🇷🇼
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
