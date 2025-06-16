import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/iwanyu logo.png" 
              alt="Logo" 
              className="h-8 w-auto filter brightness-0 invert"
            />
          </div>
          <p className="text-gray-400 max-w-md mx-auto">
            Your premier online shopping destination for quality products at unbeatable prices.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link to="/about" className="hover:text-orange-400 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-orange-400 transition-colors">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
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