import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Star, Zap, Flame, Heart } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto-rotation with pause on hover
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, isMobile ? 6000 : 4000);

    return () => clearInterval(interval);
  }, [banners.length, isHovered, isMobile]);

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
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Banner Container */}
      <div className={`relative ${isMobile ? 'h-64 sm:h-72' : 'h-96 lg:h-[32rem]'} rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 border border-white/10`}>
        
        {/* Banner Images with Enhanced Animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="absolute inset-0"
          >
            {/* Background Image with Parallax Effect */}
            <motion.div
              animate={{ 
                scale: isHovered ? 1.05 : 1,
                filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
              }}
              transition={{ duration: 0.6 }}
              className="w-full h-full"
            >
              <img
                src={banners[currentBanner].image}
                alt={banners[currentBanner].title}
                className="w-full h-full object-cover"
                loading={currentBanner === 0 ? "eager" : "lazy"}
              />
            </motion.div>

            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/60 to-black/70" />

            {/* Additional animated gradient layer */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 25% 75%, rgba(120, 119, 198, 0.4) 0%, transparent 50%),
                  radial-gradient(circle at 75% 25%, rgba(255, 119, 120, 0.4) 0%, transparent 50%)
                `
              }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Glass Morphism Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`text-center text-white ${isMobile ? 'p-4 max-w-xs' : 'p-8 max-w-2xl'}`}
              >
                {/* Glass Card Background */}
                <div className="backdrop-blur-lg bg-white/8 rounded-3xl p-6 md:p-8 border-2 border-white/20 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                  
                  {/* Floating Elements */}
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-4 -right-4 text-yellow-300"
                  >
                    <Sparkles size={isMobile ? 20 : 24} />
                  </motion.div>

                  {/* Title with Enhanced Typography */}
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className={`font-bold mb-3 md:mb-4 ${
                      isMobile 
                        ? 'text-2xl sm:text-3xl' 
                        : 'text-4xl md:text-5xl lg:text-6xl'
                    } bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl`}
                  >
                    {banners[currentBanner].title}
                  </motion.h1>

                  {/* Subtitle with Better Spacing */}
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className={`mb-6 md:mb-8 text-gray-100 ${
                      isMobile ? 'text-sm' : 'text-lg md:text-xl'
                    } font-medium leading-relaxed drop-shadow-lg`}
                  >
                    {banners[currentBanner].subtitle}
                  </motion.p>

                  {/* Enhanced CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/products" 
                      className={`group inline-flex items-center ${
                        isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-4 text-base md:text-lg'
                      } bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white rounded-full font-bold shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 transform hover:scale-105 border border-white/20 relative overflow-hidden`}
                    >
                      <Play size={isMobile ? 16 : 20} className="mr-2 group-hover:translate-x-1 transition-transform" />
                      {banners[currentBanner].cta}
                      <ArrowRight size={isMobile ? 16 : 20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>

                  {/* Star Rating Decoration */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex justify-center mt-4 space-x-1"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                      >
                        <Star 
                          size={isMobile ? 14 : 16} 
                          className="text-yellow-300 fill-current drop-shadow-lg" 
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Navigation Arrows (Desktop) */}
        {!isMobile && banners.length > 1 && (
          <>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, x: -5 }}
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full shadow-lg transition-all duration-300 border border-white/20"
            >
              <ArrowRight size={20} className="rotate-180" />
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1, x: 5 }}
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full shadow-lg transition-all duration-300 border border-white/20"
            >
              <ArrowRight size={20} />
            </motion.button>
          </>
        )}
      </div>

      {/* Enhanced Indicators */}
      {banners.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className={`absolute ${isMobile ? 'bottom-4' : 'bottom-6'} left-1/2 transform -translate-x-1/2 flex space-x-3`}
        >
          {banners.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`relative ${isMobile ? 'w-8 h-2' : 'w-12 h-3'} rounded-full transition-all duration-300 ${
                currentBanner === index 
                  ? 'bg-white shadow-lg shadow-white/50' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            >
              {currentBanner === index && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Progress Bar */}
      {banners.length > 1 && !isHovered && (
        <motion.div
          key={currentBanner}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ 
            duration: isMobile ? 6 : 4,
            ease: "linear"
          }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-red-400 origin-left rounded-full"
        />
      )}
    </div>
  );
};

export default ModernBanner; 