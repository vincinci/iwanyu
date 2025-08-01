import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Cart, CartItem, Product, Notification } from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Cart Store
interface CartState {
  cart: Cart;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, variant?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        total: 0,
        itemCount: 0,
      },
      isOpen: false,

      addItem: (product, quantity = 1, variant) => {
        const { cart } = get();
        const existingItemIndex = cart.items.findIndex(
          (item) =>
            item.productId === product.id &&
            item.variant === variant
        );

        let newItems: CartItem[];

        if (existingItemIndex > -1) {
          // Update existing item
          newItems = cart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${variant || 'default'}-${Date.now()}`,
            productId: product.id,
            vendorId: product.vendorId,
            quantity,
            price: product.salePrice || product.price,
            variant,
            product,
          };
          newItems = [...cart.items, newItem];
        }

        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const itemCount = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        set({
          cart: {
            items: newItems,
            total,
            itemCount,
          },
        });
      },

      removeItem: (itemId) => {
        const { cart } = get();
        const newItems = cart.items.filter((item) => item.id !== itemId);
        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const itemCount = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        set({
          cart: {
            items: newItems,
            total,
            itemCount,
          },
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const { cart } = get();
        const newItems = cart.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        const total = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const itemCount = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        set({
          cart: {
            items: newItems,
            total,
            itemCount,
          },
        });
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            total: 0,
            itemCount: 0,
          },
        });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setCartOpen: (open) => {
        set({ isOpen: open });
      },

      getCartTotal: () => {
        return get().cart.total;
      },

      getCartItemCount: () => {
        return get().cart.itemCount;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

// UI Store
interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  theme: 'light' | 'dark';
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isMobileMenuOpen: false,
      isSearchOpen: false,
      theme: 'light',

      toggleMobileMenu: () => {
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
      },

      setMobileMenuOpen: (open) => {
        set({ isMobileMenuOpen: open });
      },

      toggleSearch: () => {
        set((state) => ({ isSearchOpen: !state.isSearchOpen }));
      },

      setSearchOpen: (open) => {
        set({ isSearchOpen: open });
      },

      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);

// Notifications Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
    };

    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { notifications, unreadCount };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
      unreadCount: 0,
    }));
  },

  removeNotification: (notificationId) => {
    set((state) => {
      const notifications = state.notifications.filter(
        (notification) => notification.id !== notificationId
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { notifications, unreadCount };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
