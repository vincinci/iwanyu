import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      isActive: location.pathname === '/'
    },
    {
      path: '/products',
      icon: Search,
      label: 'Search',
      isActive: location.pathname === '/products'
    },
    {
      path: '/cart',
      icon: ShoppingCart,
      label: 'Cart',
      badge: itemCount,
      isActive: location.pathname === '/cart'
    },
    {
      path: '/wishlist',
      icon: Heart,
      label: 'Wishlist',
      badge: wishlistCount,
      isActive: location.pathname === '/wishlist'
    },
    {
      path: user ? '/dashboard' : '/login',
      icon: User,
      label: user ? 'Account' : 'Login',
      isActive: location.pathname.includes('/dashboard') || location.pathname === '/login'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 relative ${
                item.isActive 
                  ? 'text-orange-500' 
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={item.isActive ? 'fill-current' : ''} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {item.isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav; 