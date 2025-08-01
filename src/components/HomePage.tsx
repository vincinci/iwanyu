'use client';

import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  PhoneIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { formatCurrency } from '@/lib/utils';

const features = [
  {
    icon: ShoppingBagIcon,
    title: 'Wide Selection',
    description: 'Thousands of products from trusted local vendors across Rwanda',
  },
  {
    icon: TruckIcon,
    title: 'Fast Delivery',
    description: 'Quick and reliable delivery to your doorstep nationwide',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Shopping',
    description: 'Safe payments in RWF and buyer protection for peace of mind',
  },
  {
    icon: PhoneIcon,
    title: '24/7 Support',
    description: 'Customer support available anytime to help you',
  },
];

const categories = [
  {
    name: 'Electronics',
    description: 'Phones, laptops, and gadgets',
    image: '/categories/electronics.jpg',
    href: '/categories/electronics',
  },
  {
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories',
    image: '/categories/fashion.jpg',
    href: '/categories/fashion',
  },
  {
    name: 'Home & Garden',
    description: 'Furniture, decor, and tools',
    image: '/categories/home-garden.jpg',
    href: '/categories/home-garden',
  },
  {
    name: 'Health & Beauty',
    description: 'Skincare, makeup, and wellness',
    image: '/categories/health-beauty.jpg',
    href: '/categories/health-beauty',
  },
  {
    name: 'Sports & Outdoors',
    description: 'Fitness, camping, and sports gear',
    image: '/categories/sports.jpg',
    href: '/categories/sports',
  },
  {
    name: 'Books & Media',
    description: 'Books, music, and entertainment',
    image: '/categories/books.jpg',
    href: '/categories/books',
  },
];

export function HomePage() {
  return (
    <div className="space-y-0">
      {/* Hero Section - AliExpress Style */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-yellow-400 font-medium text-sm uppercase tracking-wide">
                  Rwanda's #1 Marketplace
                </p>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Shop Smart,
                  <br />
                  <span className="text-yellow-400">Shop Local</span>
                </h1>
              </div>
              <p className="text-lg text-gray-300 max-w-lg">
                Discover thousands of products from trusted vendors across Rwanda. 
                Fast delivery, secure payments in RWF, unbeatable local prices.
              </p>
              
              {/* Search Bar */}
              <div className="bg-white rounded-lg p-2 flex items-center max-w-lg">
                <input
                  type="text"
                  placeholder="Search for products, brands and categories..."
                  className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6">
                  Search
                </Button>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">10K+</div>
                  <div className="text-sm text-gray-400">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-gray-400">Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Featured Products/Banner */}
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 text-black">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                      Limited Time
                    </span>
                    <span className="text-sm font-medium">Up to 70% OFF</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold">
                    Super Sale
                  </h3>
                  <p className="text-gray-800">
                    Exclusive deals on electronics, fashion, and more
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-black text-black hover:bg-black hover:text-white"
                  >
                    Shop Now
                  </Button>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-20 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white opacity-20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Categories - AliExpress Style */}
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center lg:justify-between gap-6">
            {categories.slice(0, 6).map((category, index) => (
              <Link 
                key={index} 
                href={category.href}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-yellow-100 transition-colors">
                  <span className="text-xl">📦</span>
                </div>
                <span className="text-sm font-medium text-gray-900 group-hover:text-yellow-600 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Flash Deals
              </h2>
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Limited Time
              </div>
            </div>
            <Link href="/deals" className="text-yellow-600 hover:text-yellow-700 font-medium">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative">
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    -50%
                  </div>
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📱
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    Premium Product Name Here
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-500">{formatCurrency(4990)}</span>
                    <span className="text-sm text-gray-400 line-through">{formatCurrency(9990)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories - AliExpress Grid Style */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                href={category.href}
                className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:border-yellow-400"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-70">
                    📦
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center text-yellow-600 text-sm font-medium">
                    <span>Shop Now</span>
                    <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Clean White Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Popular Products
            </h2>
            <Link href="/products" className="text-yellow-600 hover:text-yellow-700 font-medium">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🛍️
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    Popular Item {item}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(Math.floor(Math.random() * 50000) + 5000)}</span>
                    <div className="flex text-yellow-400 text-xs">
                      ★★★★☆
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor CTA - AliExpress Style */}
      <section className="bg-gradient-to-r from-yellow-400 to-orange-500 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-2/3 text-black mb-8 lg:mb-0">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Start Selling Today
              </h2>
              <p className="text-lg mb-6 max-w-2xl">
                Join thousands of successful vendors on iwanyu. Reach customers across Rwanda, 
                grow your business, and increase your revenue with our powerful platform.
              </p>
              
              <div className="grid grid-cols-3 gap-6 max-w-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">0%</div>
                  <div className="text-sm">Commission for 1st month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">24/7</div>
                  <div className="text-sm">Seller Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">Fast</div>
                  <div className="text-sm">Setup Process</div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/3 text-center">
              <Link href="/sell">
                <Button 
                  size="xl" 
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-12 py-4 text-lg"
                >
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter - Clean White */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Stay in the Loop
            </h2>
            <p className="text-gray-600 mb-8">
              Get exclusive deals, new product alerts, and vendor highlights delivered to your inbox
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <Button 
                type="submit"
                className="bg-black hover:bg-gray-800 text-white font-semibold px-8"
              >
                Subscribe
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
