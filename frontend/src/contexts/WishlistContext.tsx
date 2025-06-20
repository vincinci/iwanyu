import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSafeToast } from './ToastContext';
import { wishlistApi } from '../services/wishlistApi';
import type { WishlistItem } from '../services/wishlistApi';

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  refreshWishlist: () => Promise<void>;
  moveToCart: (productId: string, quantity?: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useSafeToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist when user logs in
  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      // Clear wishlist when user logs out
      setItems([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);

      setItems(response.data.items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      // Don't show error to user for wishlist failures
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string): Promise<void> => {
    if (!user) {
      showInfo('Sign In Required', 'Please sign in to add items to your wishlist');
      throw new Error('You must be logged in to add items to wishlist');
    }

    console.log('🔄 Adding to wishlist:', productId);
    
    try {

      console.log('✅ API Response:', response);
      
      // Add the new item to the state
      setItems(prev => {
        const newItems = [response.data, ...prev];
        console.log('📝 Updated wishlist items:', newItems.length);
        return newItems;
      });
      
      // Show success message
      showSuccess('Added to Wishlist', 'Product has been added to your wishlist!');
      console.log('✅ Added to wishlist:', response.message);
    } catch (error) {
      console.error('❌ Failed to add to wishlist:', error);
      if (error instanceof Error) {
        showError('Failed to Add', `Could not add to wishlist: ${error.message}`);
      } else {
        showError('Failed to Add', 'Could not add to wishlist. Please try again.');
      }
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    if (!user) return;

    try {
      await wishlistApi.removeFromWishlist(productId);
      
      // Remove the item from state
      setItems(prev => prev.filter(item => item.productId !== productId));
      
      console.log('Removed from wishlist');
      showSuccess('Removed from Wishlist', 'Product has been removed from your wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      if (error instanceof Error) {
        showError('Failed to Remove', `Could not remove from wishlist: ${error.message}`);
      } else {
        showError('Failed to Remove', 'Could not remove from wishlist. Please try again.');
      }
      throw error;
    }
  };

  const clearWishlist = async (): Promise<void> => {
    if (!user) return;

    try {
      await wishlistApi.clearWishlist();
      setItems([]);
      console.log('Wishlist cleared');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some(item => item.productId === productId);
  };

  const moveToCart = async (productId: string, quantity: number = 1): Promise<void> => {
    if (!user) return;

    try {
      await wishlistApi.moveToCart(productId, quantity);
      
      // Remove the item from wishlist state
      setItems(prev => prev.filter(item => item.productId !== productId));
      
      console.log('Moved to cart');
    } catch (error) {
      console.error('Failed to move to cart:', error);
      throw error;
    }
  };

  const refreshWishlist = async (): Promise<void> => {
    await loadWishlist();
  };

  const value: WishlistContextType = {
    items,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    wishlistCount: items.length,
    refreshWishlist,
    moveToCart,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 