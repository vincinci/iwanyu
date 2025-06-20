import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
  quantity: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images?: string[];
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  resetCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // If there's an error loading the cart, clear it
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === (product as any).id);
      
      if (existingItem) {
        // If item already in cart, increase quantity
        return currentItems.map(item =>
          item.id === (product as any).id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      } else {
        // Add new item to cart - prices are stored as actual values, not in cents
        const newItem: CartItem = {
          id: (product as any).id,
          name: (product as any).name,
          price: (product as any).price,
          salePrice: (product as any).salePrice,
          image: (product as any).images?.[0],
          quantity: 1,
          stock: (product as any).stock,
        };
        return [...currentItems, newItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const resetCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Calculate total amount using actual price values (not cents)
  const item = items.reduce((total, item) => {
    const price = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
    return total + (price * item.quantity);
  }, 0);

  const value = {
    items,
    itemCount,
    totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    resetCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 