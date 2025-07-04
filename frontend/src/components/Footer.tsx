import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/iwanyu-logo.png" 
              alt="Iwanyu Store Logo" 
              className="h-6 w-auto sm:h-7 md:h-8 max-w-[100px] sm:max-w-[120px] md:max-w-[140px]"
            />
          </div>
          <p className="text-gray-400 max-w-md mx-auto">
            Your premier online shopping destination for quality products at unbeatable prices.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link to="/about" className="hover:text-gray-500 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-gray-500 transition-colors">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-gray-500 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-gray-500 transition-colors">Terms of Service</Link>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Iwanyu Store. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 