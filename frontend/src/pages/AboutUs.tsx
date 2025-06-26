import React from 'react';
import { motion } from 'framer-motion';
import { Store, Users, Award, Heart } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">About Iwanyu Store</h1>

        {/* Mission Statement */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            At Iwanyu Store, we're dedicated to providing Rwandans with access to quality products at competitive prices. 
            Our mission is to make online shopping accessible, convenient, and enjoyable for everyone in Rwanda.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <Store className="w-12 h-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600">
              We carefully select our products to ensure they meet the highest standards of quality and reliability.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <Users className="w-12 h-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2">Customer First</h3>
            <p className="text-gray-600">
              Your satisfaction is our priority. We're committed to providing exceptional customer service.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <Award className="w-12 h-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2">Trust & Reliability</h3>
            <p className="text-gray-600">
              We build trust through transparent operations and reliable delivery of our promises.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <Heart className="w-12 h-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
            <p className="text-gray-600">
              We're proud to contribute to Rwanda's growing e-commerce ecosystem and economic development.
            </p>
          </motion.div>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Story</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Founded in 2024, Iwanyu Store has quickly become a trusted name in Rwanda's e-commerce landscape. 
            We started with a simple idea: to make quality products accessible to everyone in Rwanda through 
            a seamless online shopping experience.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Today, we continue to grow and evolve, always staying true to our core values of quality, 
            customer satisfaction, and community impact. We're excited to be part of Rwanda's digital 
            transformation journey and look forward to serving you for many years to come.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs; 