import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface BannerData {
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  gradient?: string;
  accentColor?: string;
}

interface ModernBannerProps {
  banners: BannerData[];
  isMobile?: boolean;
  className?: string;
}

const ModernBanner: React.FC<ModernBannerProps> = ({ 
  banners, 
  isMobile = false, 
  className = "" 
}) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto-rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    } else if (isRightSwipe) {
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const goToSlide = useCallback((index: number) => {
    setCurrentBanner(index);
  }, []);

  if (!banners.length) return null;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Simple Banner Container */}
      <div className={`relative ${isMobile ? 'h-64 sm:h-72' : 'h-96 lg:h-[28rem]'} rounded-2xl overflow-hidden`}>
        
        {/* Banner Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Clean Image Display */}
            <img
              src={banners[currentBanner].image}
              alt={banners[currentBanner].title}
              className="w-full h-full object-contain bg-gray-100"
              loading={currentBanner === 0 ? "eager" : "lazy"}
            />

            {/* Single Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Link 
                  to="/products" 
                  className={`inline-flex items-center ${
                    isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-4 text-lg'
                  } bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  {banners[currentBanner].cta}
                  <ArrowRight size={isMobile ? 16 : 20} className="ml-2" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Desktop) */}
        {!isMobile && banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
            >
              <ArrowRight size={20} className="rotate-180" />
            </button>
            
            <button
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
            >
              <ArrowRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Simple Indicators */}
      {banners.length > 1 && (
        <div className={`absolute ${isMobile ? 'bottom-4' : 'bottom-6'} left-1/2 transform -translate-x-1/2 flex space-x-2`}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${isMobile ? 'w-8 h-2' : 'w-12 h-3'} rounded-full transition-all duration-300 ${
                currentBanner === index 
                  ? 'bg-orange-500' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernBanner; 