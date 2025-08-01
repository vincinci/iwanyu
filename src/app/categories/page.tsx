'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Layout } from '@/components/Layout';
import { Category } from '@/types';
import { cn } from '@/lib/utils';
import { categoriesAPI } from '@/lib/api';

// Mock categories data
const mockCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smartphones, laptops, accessories and more',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    isActive: true,
    order: 1,
  },
  {
    id: 'fashion',
    name: 'Fashion & Clothing',
    slug: 'fashion',
    description: 'Traditional and modern clothing for all occasions',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    isActive: true,
    order: 2,
  },
  {
    id: 'home-garden',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Furniture, decor, and garden essentials',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop',
    isActive: true,
    order: 3,
  },
  {
    id: 'food-beverages',
    name: 'Food & Beverages',
    slug: 'food-beverages',
    description: 'Fresh produce, local delicacies, and beverages',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    isActive: true,
    order: 4,
  },
  {
    id: 'beauty-health',
    name: 'Beauty & Health',
    slug: 'beauty-health',
    description: 'Cosmetics, skincare, and wellness products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    isActive: true,
    order: 5,
  },
  {
    id: 'sports-outdoors',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment, outdoor gear, and fitness accessories',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    isActive: true,
    order: 6,
  },
  {
    id: 'books-media',
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Books, music, movies, and educational materials',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    isActive: true,
    order: 7,
  },
  {
    id: 'automotive',
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car parts, accessories, and automotive services',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    isActive: true,
    order: 8,
  },
  {
    id: 'crafts-handmade',
    name: 'Crafts & Handmade',
    slug: 'crafts-handmade',
    description: 'Traditional crafts, handmade items, and artisanal products',
    image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop',
    isActive: true,
    order: 9,
  },
  {
    id: 'baby-kids',
    name: 'Baby & Kids',
    slug: 'baby-kids',
    description: 'Toys, clothing, and essentials for children',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    isActive: true,
    order: 10,
  },
  {
    id: 'office-business',
    name: 'Office & Business',
    slug: 'office-business',
    description: 'Office supplies, business equipment, and services',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    isActive: true,
    order: 11,
  },
  {
    id: 'services',
    name: 'Services',
    slug: 'services',
    description: 'Professional services, repairs, and consultations',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    isActive: true,
    order: 12,
  },
];

// Featured categories with special styling
const featuredCategories = [
  'electronics',
  'fashion',
  'food-beverages',
  'crafts-handmade',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoriesAPI.getCategories();
        
        if (response.categories) {
          setCategories(response.categories.filter((cat: Category) => cat.isActive));
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const featured = categories.filter(cat => featuredCategories.includes(cat.id));
  const regular = categories.filter(cat => !featuredCategories.includes(cat.id));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing products from local Rwandan sellers across all categories
          </p>
        </div>

        {/* Featured Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={category.image!}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-600 font-medium">Shop Now</span>
                      <ChevronRightIcon className="h-5 w-5 text-yellow-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Categories */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">All Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regular.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <div className="group bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={category.image!}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center text-yellow-600 text-sm font-medium">
                      <span>Explore</span>
                      <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Categories Stats */}
        <section className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Shop with iwanyu?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🇷🇼</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Sellers</h3>
              <p className="text-gray-600">
                Support local Rwandan businesses and entrepreneurs
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Products</h3>
              <p className="text-gray-600">
                Carefully curated products from verified vendors
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick and reliable delivery across Rwanda
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
