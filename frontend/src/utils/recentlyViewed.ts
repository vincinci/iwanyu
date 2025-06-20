// Utility functions for tracking recently viewed products

const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENT_ITEMS = 20;

export const addToRecentlyViewed = async (productId: string, isLoggedIn: boolean = false) => {
  try {
    if (isLoggedIn) {
      // For logged-in users, send to backend
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/users/recently-viewed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
      }
    } else {
      // For guests, use localStorage
      const existing = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
      
      // Remove if already exists to avoid duplicates
      const filtered = existing.filter((id: string) => id !== productId);
      
      // Add to beginning of array
      const updated = [productId, ...filtered].slice(0, MAX_RECENT_ITEMS);
      
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

export const getRecentlyViewed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};

export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};

export const removeFromRecentlyViewed = (productId: string) => {
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter(id => id !== productId);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
  }
}; 