import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus, 
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  Package,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  ThumbsUp,
  ChevronDown,
  Heart,
  Share2
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatPrice } from '../utils/currency';
import { getProductImageUrls, getFallbackImageUrl } from '../utils/imageUtils';
import { useInstantProduct } from '../hooks/useInstantProducts';
import ProductSkeleton from '../components/ProductSkeleton';
import ReviewSection from '../components/ReviewSection';
import SimilarProducts from '../components/SimilarProducts';
import type { Product, ProductVariant } from '../types/api';
import { addToRecentlyViewed } from '../utils/recentlyViewed';

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { user } = useAuth();
  const { showError } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Helper function to get product rating from actual data
  const getProductRating = (product: any) => {
    // Use actual product rating if available
    if ((product as any)?.avgRating && (product as any).avgRating > 0) {
      return parseFloat((product as any).avgRating.toFixed(1));
    }
    return 0;
  };

  // Use instant loading for product
  const { product, isInstantLoading, hasInstantData} = useInstantProduct(id!, !!id);

  // Track recently viewed
  useEffect(() => {
    if (product && id) {
      addToRecentlyViewed(id, !!user);
    }
  }, [product, id, user]);

  // Check if product is in wishlist
  const productInWishlist = product ? isInWishlist((product as any).id) : false;

  // Group variants by name (Size, Color, etc.)
  const variantGroups = (product as any)?.variants?.reduce((groups: Record<string, ProductVariant[]>, variant: ProductVariant) => {
    if (!groups[variant.name]) {
      groups[variant.name] = [];
    }
    groups[variant.name].push(variant);
    return groups;
  }, {} as Record<string, ProductVariant[]>) || {};

  // Calculate current price based on selected variants
  const getCurrentPrice = () => {
    if (!product) return 0;
    
    // Find selected variants and use their price if different from base price
    let variantPrice: number | null = null;
    
    Object.entries(selectedVariants).forEach(([variantName, variantValue]) => {
      const variant = (product as any).variants?.find((v: ProductVariant) => v.name === variantName && v.value === variantValue);
      if (variant && variant.price && variant.price !== (product as any).price) {
        variantPrice = variant.price;
      }
    });
    
    const basePrice = (product as any).salePrice && (product as any).salePrice < (product as any).price ? (product as any).salePrice : (product as any).price;
    return variantPrice || basePrice;
  };

  // Calculate current stock based on selected variants
  const getCurrentStock = () => {
    if (!product) return 0;
    
    // If no variants selected or no variants exist, return base product stock
    if (Object.keys(selectedVariants).length === 0 || !(product as any).variants?.length) {
      return (product as any).stock;
    }
    
    // Find the minimum stock among selected variants
    let minStock = (product as any).stock;
    
    Object.entries(selectedVariants).forEach(([variantName, variantValue]) => {
      const variant = (product as any).variants?.find((v: ProductVariant) => v.name === variantName && v.value === variantValue);
      if (variant) {
        minStock = Math.min(minStock, variant.stock);
      }
    });
    
    return minStock;
  };

  // Check if all required variants are selected
  const areAllVariantsSelected = () => {
    const requiredVariantNames = Object.keys(variantGroups);
    return requiredVariantNames.every(name => selectedVariants[name]);
  };

  const handleVariantSelect = (variantName: string, variantValue: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: variantValue
    }));
  };

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showShareDropdown && !target.closest('.share-dropdown-container')) {
        setShowShareDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareDropdown]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    // Add the specified quantity to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    // Reset quantity and show feedback
    setQuantity(1);
    
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1000);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please sign in to add items to your wishlist' 
        }
      });
      return;
    }

    if (!product) return;

    setIsAddingToWishlist(true);
    
    try {
      if (productInWishlist) {
        await removeFromWishlist((product as any).id);
        console.log('✅ Successfully removed from wishlist');
      } else {
        await addToWishlist((product as any).id);
        console.log('✅ Successfully added to wishlist');
      }
    } catch (error) {
      console.error('❌ Wishlist error:', 'Error occurred');
      // Show more detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Failed to update wishlist';
      console.error('Error details:', errorMessage);
      showError('Wishlist Error', errorMessage);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: (product as any).name,
      text: `Check out this ${(product as any).name} - ${formatPrice(getCurrentPrice())}`,
      url: window.location.href,
    };

    try {
      // Try native Web Share API first (mobile browsers)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShowShareDropdown(false);
      } else {
        // Show dropdown for desktop
        setShowShareDropdown(!showShareDropdown);
      }
    } catch (error) {
      // Fallback: show dropdown
      setShowShareDropdown(!showShareDropdown);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setShowShareDropdown(false);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (error) {
      console.error('Copy failed:', 'Error occurred');
      showError('Copy Failed', 'Unable to copy link. Please copy the URL manually.');
    }
  };

  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this ${(product as any).name} - ${formatPrice(getCurrentPrice())}`);
    const title = encodeURIComponent((product as any).name);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${text}%20${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareDropdown(false);
  };

  if (isInstantLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <ProductSkeleton variant="detail" />
        </div>
      </div>
    );
  }

  if (false || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product not found</h2>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/products"
              className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const currentStock = getCurrentStock();
  const hasDiscount = (product as any)?.salePrice && (product as any).salePrice < (product as any).price;
  const discountPercentage = hasDiscount ? Math.round((((product as any).price - (product as any).salePrice!) / (product as any).price) * 100) : 0;
  const itemInCart = getItemQuantity((product as any)?.id || '');
  const hasVariants = Object.keys(variantGroups).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Debug: Log image URLs */}
        {(() => { try { console.log('Product image URLs:', getProductImageUrls(product)); } catch (e) {} return null; })()}
        {/* Breadcrumb - Hidden on mobile to save space */}
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{(product as any).name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div>
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden mb-4"
            >
              {(() => {
                const imageUrls = getProductImageUrls(product);
                return imageUrls.length > 0 ? (
                  <img
                    src={imageUrls[selectedImageIndex] || imageUrls[0]}
                    alt={(product as any).name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = getFallbackImageUrl(); }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="text-gray-400" size={64} />
                  </div>
                );
              })()}
            </motion.div>

            {/* Image Thumbnails */}
            {(() => {
              const imageUrls = getProductImageUrls(product);
              return imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {imageUrls.map((imageUrl: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded border-2 overflow-hidden transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-gray-400 ring-2 ring-orange-500 ring-opacity-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${(product as any).name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.src = getFallbackImageUrl(); }}
                      />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Product Info */}
          <div>
            {/* Category & Stock Status */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {product.category?.name || 'Uncategorized'}
              </span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleWishlistToggle}
                  disabled={isAddingToWishlist}
                  className={`p-1 border border-gray-300 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    productInWishlist 
                      ? 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100' 
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                  }`}
                  aria-label={productInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  title={productInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isAddingToWishlist ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  ) : (
                    <Heart size={16} className={productInWishlist ? "fill-current" : ""} />
                  )}
                </button>
                <div className="relative share-dropdown-container">
                  <button 
                    onClick={handleShare}
                    className="p-2 text-gray-600 hover:text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Share product"
                    title="Share product"
                  >
                    <Share2 size={18} />
                  </button>
                  
                  {/* Share Dropdown */}
                  {showShareDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <div className="py-2">
                        <button
                          onClick={handleCopyLink}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Share2 size={16} className="mr-3" />
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleSocialShare('whatsapp')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <span className="mr-3 text-green-500">📱</span>
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleSocialShare('facebook')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <span className="mr-3 text-blue-600">📘</span>
                          Facebook
                        </button>
                        <button
                          onClick={() => handleSocialShare('twitter')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <span className="mr-3 text-blue-400">🐦</span>
                          Twitter
                        </button>
                        <button
                          onClick={() => handleSocialShare('email')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <span className="mr-3 text-gray-600">📧</span>
                          Email
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Copy Success Tooltip */}
                  {showShareTooltip && (
                    <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                      Link copied to clipboard!
                      <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title - Mobile responsive */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {(product as any).name}
            </h1>

            {/* Product Rating and Reviews - Only show if ratings exist */}
            {(product as any).avgRating > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor((product as any).avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" />
                      {(product as any).avgRating.toFixed(1)} ({(product as any).totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Seller Information - Remove 'Unknown Seller' fallback */}
            {product.seller && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Sold by</h3>
                <p className="text-gray-600">
                  {product.seller.businessName || 
                    (product.seller.user?.firstName && product.seller.user?.lastName 
                                ? `${product.seller.user?.firstName} ${product.seller.user?.lastName}`
                      : (product.seller.user?.name || 'Seller'))}
                </p>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice((product as any).price)}
                    </span>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              {hasDiscount && (
                <p className="text-black text-sm mt-1">
                  You save {formatPrice((product as any).price - currentPrice)}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {currentStock > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">
                    {currentStock > 10 ? 'In Stock' : `Only ${currentStock} left`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Variants */}
            {hasVariants && (
              <div className="mb-8 space-y-6">
                {Object.entries(variantGroups).map(([variantName, variants]) => (
                  <div key={variantName}>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {variantName}: 
                      {selectedVariants[variantName] && (
                        <span className="font-normal text-gray-700 ml-2">
                          {selectedVariants[variantName]}
                        </span>
                      )}
                    </h4>
                    
                    {variantName.toLowerCase() === 'color' ? (
                      // Color swatches for color variants
                      <div className="flex flex-wrap gap-3">
                        {(variants as ProductVariant[]).map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => handleVariantSelect(variantName, variant.value)}
                            className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                              selectedVariants[variantName] === variant.value
                                ? 'border-gray-400 ring-2 ring-orange-500 ring-opacity-50'
                                : 'border-gray-300 hover:border-gray-400'
                            } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={variant.stock === 0}
                            title={`${variant.value} ${variant.stock === 0 ? '(Out of stock)' : `(${variant.stock} available)`}`}
                            style={{
                              backgroundColor: variant.value.toLowerCase() === 'white' ? '#ffffff' :
                                            variant.value.toLowerCase() === 'black' ? '#000000' :
                                            variant.value.toLowerCase() === 'red' ? '#dc2626' :
                                            variant.value.toLowerCase() === 'blue' ? '#2563eb' :
                                            variant.value.toLowerCase() === 'navy blue' ? '#1e3a8a' :
                                            variant.value.toLowerCase() === 'gray' ? '#6b7280' :
                                            '#9ca3af'
                            }}
                          >
                            {selectedVariants[variantName] === variant.value && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${
                                  variant.value.toLowerCase() === 'white' || variant.value.toLowerCase() === 'gray' 
                                    ? 'bg-gray-800' 
                                    : 'bg-white'
                                }`}></div>
                              </div>
                            )}
                            {variant.stock === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      // Regular buttons for other variants (Size, etc.)
                      <div className="flex flex-wrap gap-2">
                        {(variants as ProductVariant[]).map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => handleVariantSelect(variantName, variant.value)}
                            disabled={variant.stock === 0}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                              selectedVariants[variantName] === variant.value
                                ? 'border-gray-400 bg-gray-50 text-gray-700'
                                : variant.stock === 0
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                            title={variant.stock === 0 ? 'Out of stock' : `${variant.stock} available`}
                          >
                            {variant.value}
                            {variant.stock === 0 && (
                              <span className="ml-1 text-xs">(Out)</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Price difference indicator */}
                    {selectedVariants[variantName] && (
                      (() => {
                        const selectedVariant = (variants as ProductVariant[]).find((v: ProductVariant) => v.value === selectedVariants[variantName]);
                        const priceDiff = selectedVariant?.price && selectedVariant.price !== (product as any).price 
                          ? selectedVariant.price - (product as any).price 
                          : 0;
                        
                        return priceDiff !== 0 ? (
                          <p className={`text-xs mt-2 ${priceDiff > 0 ? 'text-black' : 'text-black'}`}>
                            {priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)} {priceDiff > 0 ? 'extra' : 'discount'}
                          </p>
                        ) : null;
                      })()
                    )}
                  </div>
                ))}
                
                {/* Variant selection warning */}
                {hasVariants && !areAllVariantsSelected() && (
                  <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="text-amber-500" size={16} />
                    <span className="text-amber-700 text-sm">
                      Please select all options to continue
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Add to Cart - Desktop */}
            {currentStock > 0 && (
              <div className="space-y-4 hidden md:block">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                      disabled={quantity >= currentStock}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentStock} available
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || (hasVariants && !areAllVariantsSelected())}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-orange-300 text-white py-2 px-6 rounded-md font-medium transition-colors duration-200 flex items-center justify-center disabled:cursor-not-allowed text-sm"
                  >
                    <ShoppingCart className="mr-1.5" size={16} />
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-8">
        <ReviewSection 
          productId={(product as any).id} 
          productName={(product as any).name}
          productPrice={getCurrentPrice()}
        />
      </div>

      {/* Similar Products */}
      <div className="container mx-auto px-4 py-8">
        <SimilarProducts currentProduct={product} />
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {currentStock > 0 && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 safe-area-inset">
          <div className="flex items-center space-x-3">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-gray-200 rounded"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                className="p-1 hover:bg-gray-200 rounded"
                disabled={quantity >= currentStock}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || (hasVariants && !areAllVariantsSelected())}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-orange-300 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center disabled:cursor-not-allowed text-sm"
            >
              <ShoppingCart className="mr-1" size={14} />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 