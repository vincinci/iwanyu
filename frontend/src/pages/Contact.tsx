import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Contact Us</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Phone */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-lg shadow-md text-center"
          >
            <Phone className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Phone</h2>
            <a 
              href="tel:+250794306915" 
              className="text-gray-600 hover:text-yellow-500 transition-colors"
            >
              +250 794 306 915
            </a>
          </motion.div>

          {/* Email */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-lg shadow-md text-center"
          >
            <Mail className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Email</h2>
            <a 
              href="mailto:iwanyustore@gmail.com" 
              className="text-gray-600 hover:text-yellow-500 transition-colors"
            >
              iwanyustore@gmail.com
            </a>
          </motion.div>

          {/* Address */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-lg shadow-md text-center"
          >
            <MapPin className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Address</h2>
            <p className="text-gray-600">
              Remera, Kabeza
            </p>
          </motion.div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Our Location</h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5088477!2d30.0917!3d-1.9536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca5c5c5c5c5c5%3A0x5c5c5c5c5c5c5c5c!2sRemera%2C%20Kabeza!5e0!3m2!1sen!2srw!4v1620000000000!5m2!1sen!2srw"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact; 