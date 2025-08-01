'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebounce, useClickOutside } from '@/hooks';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: () => void;
}

export function SearchBar({ 
  className, 
  placeholder = "Search for products, brands, or vendors...",
  onSearch 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Close suggestions when clicking outside
  useClickOutside(searchRef as React.RefObject<HTMLElement>, () => {
    setIsFocused(false);
    setSuggestions([]);
  });

  // Mock suggestions - In real app, fetch from API
  const mockSuggestions = [
    'iPhone',
    'Samsung Galaxy',
    'MacBook',
    'Laptop',
    'Headphones',
    'Shoes',
    'Clothes',
    'Electronics',
    'Kitchen',
    'Home & Garden',
  ];

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setQuery('');
      setIsFocused(false);
      setSuggestions([]);
      onSearch?.();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSuggestions([]);
    }
  };

  return (
    <div 
      ref={searchRef}
      className={cn('relative w-full max-w-2xl', className)}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={cn(
            'block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg',
            'text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent',
            'bg-white shadow-sm'
          )}
        />
        
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <Button
            type="button"
            size="sm"
            onClick={() => handleSearch()}
            className="bg-yellow-400 hover:bg-yellow-500 text-black h-8 px-3"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Search suggestions */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSearch(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-3" />
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent searches or trending - could be added here */}
      {isFocused && query.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Trending Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'].map((trend) => (
                <button
                  key={trend}
                  onClick={() => handleSearch(trend)}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
