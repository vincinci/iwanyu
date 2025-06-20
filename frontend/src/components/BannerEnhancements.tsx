import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Floating particles component
export const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 12 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-white/40 rounded-full"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.8, 0.2],
        scale: [1, 2, 1],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: "easeInOut"
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

// Enhanced gradient overlay
export const EnhancedGradientOverlay: React.FC = () => (
  <>
    <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-purple-900/40" />
    <motion.div
      className="absolute inset-0 opacity-50"
      style={{
        background: `
          radial-gradient(circle at 25% 75%, rgba(120, 119, 198, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 75% 25%, rgba(255, 119, 120, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(120, 200, 120, 0.3) 0%, transparent 50%)
        `
      }}
      animate={{
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </>
);

// Animated background pattern
export const AnimatedBackgroundPattern: React.FC = () => (
  <div className="absolute inset-0 opacity-10">
    <motion.div 
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
      animate={{
        x: ['-100%', '100%']
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </div>
);

// Enhanced button with ripple effect
interface EnhancedButtonProps {
  children: React.ReactNode;
  to: string;
  size?: 'small' | 'large';
  className?: string;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({ 
  children, 
  to, 
  size = 'large',
  className = '' 
}) => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const sizeClasses = size === 'small' 
    ? 'px-6 py-3 text-sm' 
    : 'px-10 py-4 text-lg md:text-xl';

  return (
    <motion.a
      href={to}
      onClick={handleClick}
      className={`group relative inline-flex items-center ${sizeClasses} bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white rounded-full font-bold shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 border border-white/20 overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Button Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
      
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: 50,
            height: 50,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}
      
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
};

export default {
  FloatingParticles,
  EnhancedGradientOverlay,
  AnimatedBackgroundPattern,
  EnhancedButton
}; 