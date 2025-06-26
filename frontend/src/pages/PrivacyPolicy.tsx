import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Privacy Policy</h1>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              At Iwanyu Store, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <FileText className="w-6 h-6 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <p className="text-gray-600">
                    We collect information that you provide directly to us, including your name, email address, 
                    phone number, shipping address, and payment information.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Eye className="w-6 h-6 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Usage Information</h3>
                  <p className="text-gray-600">
                    We automatically collect information about your interactions with our website, including 
                    the pages you visit and the products you view.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Service Provision</h3>
                  <p className="text-gray-600">
                    To process your orders, manage your account, and provide customer support.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Lock className="w-6 h-6 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Security</h3>
                  <p className="text-gray-600">
                    To protect against fraud and unauthorized transactions, and to maintain the security of our services.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Data Protection</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, correct, or delete your personal information. You can also object to 
              the processing of your data or request data portability. To exercise these rights, please contact us.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: iwanyustore@gmail.com
              <br />
              Phone: +250 794 306 915
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy; 