import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { productsApi } from '../services/api';
import type { ProductsQueryParams } from '../types/api';
import { useInView } from 'react-intersection-observer';

// Check if we're in production (deployed)
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

// Global instant loading configuration - less aggressive for production
const INSTANT_CONFIG = {
  staleTime: isProduction ? 60 * 60 * 1000 : 30 * 60 * 1000, // 1 hour in prod, 30 min in dev
  gcTime: isProduction ? 2 * 60 * 60 * 1000 : 60 * 60 * 1000, // 2 hours in prod, 1 hour in dev
  refetchOnWindowFocus: false,
  refetchOnMount: false, // Don't refetch if data exists
  refetchOnReconnect: false,
  retry: isProduction ? 2 : 1, // More retries in production
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
};

interface UseInstantProductsOptions extends ProductsQueryParams {
  enabled?: boolean;
  prefetchNext?: boolean;
  prefetchPrevious?: boolean;
}

export const useInstantProducts = (options: UseInstantProductsOptions = {}) => {
  const queryClient = useQueryClient();
  const {
    page = 1,
    limit = 12,
    category,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    priceMin,
    priceMax,
    enabled = true,
    prefetchNext = !isProduction, // Disable prefetching in production
    prefetchPrevious = !isProduction,
  } = options;

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  });

  // Create a stable query key
  const queryKey = ['products', page, category, search, sortBy, sortOrder, priceMin, priceMax, limit];

  // Main query with instant loading optimizations
  const query = useQuery({
    queryKey,
    queryFn: () => productsApi.getAll({
      page,
      limit,
      category: category || undefined,
      search: search || undefined,
      sortBy,
      sortOrder,
      priceMin,
      priceMax,
    }),
    enabled,
    ...INSTANT_CONFIG,
    placeholderData: (previousData) => previousData, // Keep showing previous data
  });

  const totalPages = query.data?.data?.pagination?.totalPages || 1;

  // Prefetch next page - only in development or when explicitly enabled
  const prefetchNextPage = useCallback(async () => {
    if (!prefetchNext || !page || !enabled || isProduction) return;
    
    const nextPage = page + 1;
    if (nextPage > totalPages) return;
    
    await queryClient.prefetchQuery({
      queryKey: ['products', nextPage, category, search, sortBy, sortOrder, priceMin, priceMax, limit],
      queryFn: () => productsApi.getAll({ ...options, page: nextPage }),
      ...INSTANT_CONFIG
    });
  }, [prefetchNext, page, enabled, totalPages, category, search, sortBy, sortOrder, priceMin, priceMax, limit, options, queryClient]);

  // Prefetch previous page - only in development or when explicitly enabled
  const prefetchPreviousPage = useCallback(async () => {
    if (!prefetchPrevious || !page || page <= 1 || isProduction) return;
    
    const prevPage = page - 1;
    await queryClient.prefetchQuery({
      queryKey: ['products', prevPage, category, search, sortBy, sortOrder, priceMin, priceMax, limit],
      queryFn: () => productsApi.getAll({ ...options, page: prevPage }),
      ...INSTANT_CONFIG
    });
  }, [prefetchPrevious, page, category, search, sortBy, sortOrder, priceMin, priceMax, limit, options, queryClient]);

  // Reduced prefetching - only trigger on viewport in development
  useEffect(() => {
    if (inView && !isProduction) {
      prefetchNextPage();
      prefetchPreviousPage();
    }
  }, [inView, prefetchNextPage, prefetchPreviousPage]);

  // Remove aggressive prefetching strategies for production
  // Only keep essential prefetching for development

  // Prefetch category data on demand - throttled
  const prefetchCategory = useCallback(async (categorySlug: string) => {
    if (isProduction) return; // Skip in production
    
    return queryClient.prefetchQuery({
      queryKey: ['products', 1, categorySlug, search, sortBy, sortOrder, priceMin, priceMax, limit],
      queryFn: () => productsApi.getAll({
        page: 1,
        limit,
        category: categorySlug,
        search: search || undefined,
        sortBy,
        sortOrder,
        priceMin,
        priceMax,
      }),
      ...INSTANT_CONFIG,
    });
  }, [search, sortBy, sortOrder, priceMin, priceMax, limit, queryClient]);

  // Prefetch search results - throttled
  const prefetchSearch = useCallback(async (searchTerm: string) => {
    if (isProduction) return; // Skip in production
    
    return queryClient.prefetchQuery({
      queryKey: ['products', 1, category, searchTerm, sortBy, sortOrder, priceMin, priceMax, limit],
      queryFn: () => productsApi.getAll({
        page: 1,
        limit,
        category: category || undefined,
        search: searchTerm,
        sortBy,
        sortOrder,
        priceMin,
        priceMax,
      }),
      ...INSTANT_CONFIG,
    });
  }, [category, sortBy, sortOrder, priceMin, priceMax, limit, queryClient]);

  // Prefetch all products (for homepage) - throttled
  const prefetchAllProducts = useCallback(async () => {
    if (isProduction) return; // Skip in production
    
    return queryClient.prefetchQuery({
      queryKey: ['products', 1, '', '', sortBy, sortOrder, priceMin, priceMax, limit],
      queryFn: () => productsApi.getAll({
        page: 1,
        limit,
        sortBy,
        sortOrder,
        priceMin,
        priceMax,
      }),
      ...INSTANT_CONFIG,
    });
  }, [sortBy, sortOrder, priceMin, priceMax, limit, queryClient]);

  return {
    ...query,
    products: query.data?.data?.products || [],
    pagination: query.data?.data?.pagination,
    prefetchCategory,
    prefetchSearch,
    prefetchAllProducts,
    // Instant loading indicators
    isInstantLoading: query.isLoading && !query.data,
    hasInstantData: !!query.data,
    isInstantFetching: query.isFetching,
    ref,
    prefetchNextPage,
    prefetchPreviousPage,
  };
};

// Hook for single product with instant loading
export const useInstantProduct = (id: string, enabled = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id),
    enabled: enabled && !!id,
    ...INSTANT_CONFIG,
    staleTime: 15 * 60 * 1000, // 15 minutes for individual products
  });

  // Prefetch related products when product loads - only in development
  useEffect(() => {
    if (isProduction || !query.data?.data?.product?.categoryId) return;
    
    // Prefetch related products in the same category
    queryClient.prefetchQuery({
      queryKey: ['products', 1, query.data.data.product.category?.slug, '', 'createdAt', 'desc', 12],
      queryFn: () => productsApi.getAll({
        page: 1,
        limit: 12,
        category: query.data.data.product.category?.slug,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
      ...INSTANT_CONFIG,
    });
  }, [query.data, queryClient]);

  return {
    ...query,
    product: query.data?.data?.product,
    isInstantLoading: query.isLoading && !query.data,
    hasInstantData: !!query.data,
  };
};

// Global prefetcher for homepage/initial load - simplified for production
export const useGlobalPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchEverything = useCallback(async () => {
    if (isProduction) {
      // In production, only prefetch the most essential data
      try {
        await queryClient.prefetchQuery({
          queryKey: ['products', 1, '', '', 'featured', 'desc', 8],
          queryFn: () => productsApi.getAll({ page: 1, limit: 8, sortBy: 'featured', sortOrder: 'desc' }),
          ...INSTANT_CONFIG,
        });
      } catch (error) {
        console.warn('Essential prefetch failed, but app will continue normally:', error);
      }
      return;
    }

    // Development prefetching (more aggressive)
    try {
      const prefetchPromises = [
        // Prefetch first page of all products
        queryClient.prefetchQuery({
          queryKey: ['products', 1, '', '', 'createdAt', 'desc', 12],
          queryFn: () => productsApi.getAll({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
          ...INSTANT_CONFIG,
        }),
        
        // Prefetch featured products
        queryClient.prefetchQuery({
          queryKey: ['products', 1, '', '', 'featured', 'desc', 8],
          queryFn: () => productsApi.getAll({ page: 1, limit: 8, sortBy: 'featured', sortOrder: 'desc' }),
          ...INSTANT_CONFIG,
        }),
      ];

      await Promise.all(prefetchPromises);
    } catch (error) {
      console.warn('Global prefetch failed, but app will continue normally:', error);
      // Don't rethrow - let the app continue without prefetching
    }
  }, [queryClient]);

  return { prefetchEverything };
}; 