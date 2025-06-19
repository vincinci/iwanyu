import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { productsApi } from '../services/api';
import type { ProductsQueryParams } from '../types/api';
import { useInView } from 'react-intersection-observer';

// Global instant loading configuration
const INSTANT_CONFIG = {
  staleTime: 30 * 60 * 1000, // 30 minutes - very aggressive caching
  gcTime: 60 * 60 * 1000, // 1 hour in cache
  refetchOnWindowFocus: false,
  refetchOnMount: false, // Don't refetch if data exists
  refetchOnReconnect: false,
  retry: 1, // Quick failure for instant UX
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
    prefetchNext = true,
    prefetchPrevious = true,
  } = options;

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  });

  // Create a stable query key
  const queryKey = ['products', page, category, search, sortBy, sortOrder, priceMin, priceMax, limit];

  // Prefetch next page
  const prefetchNextPage = useCallback(async () => {
    if (!page || !enabled) return;
    
    const nextPage = page + 1;
    await queryClient.prefetchQuery({
      queryKey: ['products', { ...options, page: nextPage }],
      queryFn: () => productsApi.getAll({ ...options, page: nextPage }),
      ...INSTANT_CONFIG
    });
  }, [options, queryClient]);

  // Prefetch previous page
  const prefetchPreviousPage = useCallback(async () => {
    if (!page || page <= 1) return;
    
    const prevPage = page - 1;
    await queryClient.prefetchQuery({
      queryKey: ['products', { ...options, page: prevPage }],
      queryFn: () => productsApi.getAll({ ...options, page: prevPage }),
      ...INSTANT_CONFIG
    });
  }, [options, queryClient]);

  // Prefetch category pages
  const prefetchCategoryPages = useCallback(async () => {
    if (!category) return;
    
    const pages = [1, 2, 3]; // Prefetch first 3 pages
    await Promise.all(
      pages.map(page =>
        queryClient.prefetchQuery({
          queryKey: ['products', { ...options, page }],
          queryFn: () => productsApi.getAll({ ...options, page }),
          ...INSTANT_CONFIG
        })
      )
    );
  }, [options, queryClient]);

  // Prefetch search results
  const prefetchSearchResults = useCallback(async () => {
    if (!search) return;
    
    const pages = [1, 2]; // Prefetch first 2 pages of search results
    await Promise.all(
      pages.map(page =>
        queryClient.prefetchQuery({
          queryKey: ['products', { ...options, page }],
          queryFn: () => productsApi.getAll({ ...options, page }),
          ...INSTANT_CONFIG
        })
      )
    );
  }, [options, queryClient]);

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

  // Trigger prefetching based on viewport
  useEffect(() => {
    if (inView) {
      prefetchNextPage();
      prefetchPreviousPage();
    }
  }, [inView, prefetchNextPage, prefetchPreviousPage]);

  // Trigger category prefetching when category changes
  useEffect(() => {
    if (category) {
      prefetchCategoryPages();
    }
  }, [category, prefetchCategoryPages]);

  // Trigger search prefetching when search changes
  useEffect(() => {
    if (search) {
      prefetchSearchResults();
    }
  }, [search, prefetchSearchResults]);

  // Aggressive prefetching strategy
  useEffect(() => {
    if (!query.data || !enabled) return;

    const prefetchPromises: Promise<unknown>[] = [];

    // Prefetch next page
    if (prefetchNext && page < totalPages) {
      prefetchPromises.push(
        queryClient.prefetchQuery({
          queryKey: ['products', page + 1, category, search, sortBy, sortOrder, priceMin, priceMax, limit],
          queryFn: () => productsApi.getAll({
            page: page + 1,
            limit,
            category: category || undefined,
            search: search || undefined,
            sortBy,
            sortOrder,
            priceMin,
            priceMax,
          }),
          ...INSTANT_CONFIG,
        })
      );
    }

    // Prefetch previous page
    if (prefetchPrevious && page > 1) {
      prefetchPromises.push(
        queryClient.prefetchQuery({
          queryKey: ['products', page - 1, category, search, sortBy, sortOrder, priceMin, priceMax, limit],
          queryFn: () => productsApi.getAll({
            page: page - 1,
            limit,
            category: category || undefined,
            search: search || undefined,
            sortBy,
            sortOrder,
            priceMin,
            priceMax,
          }),
          ...INSTANT_CONFIG,
        })
      );
    }

    // Execute all prefetches in parallel
    Promise.all(prefetchPromises).catch(() => {
      // Silently fail prefetching - don't block main UI
    });
  }, [query.data, enabled, page, totalPages, category, search, sortBy, sortOrder, priceMin, priceMax, limit, prefetchNext, prefetchPrevious, queryClient]);

  // Prefetch category data on demand
  const prefetchCategory = useCallback((categorySlug: string) => {
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

  // Prefetch search results
  const prefetchSearch = useCallback((searchTerm: string) => {
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

  // Prefetch all products (for homepage)
  const prefetchAllProducts = useCallback(() => {
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
    prefetchCategoryPages,
    prefetchSearchResults
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

  // Prefetch related products when product loads
  useEffect(() => {
    if (!query.data?.data?.product?.categoryId) return;
    
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

// Global prefetcher for homepage/initial load
export const useGlobalPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchEverything = useCallback(async () => {
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
        
        // Prefetch popular products
        queryClient.prefetchQuery({
          queryKey: ['products', 1, '', '', 'totalSales', 'desc', 8],
          queryFn: () => productsApi.getAll({ page: 1, limit: 8, sortBy: 'totalSales', sortOrder: 'desc' }),
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