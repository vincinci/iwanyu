import React from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertCircle, FileCheck, Shield } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Terms of Service</h1>

        <div className="space-y-8">
          {/* Agreement */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using Iwanyu Store's website and services, you agree to be bound by these 
              Terms of Service and all applicable laws and regulations. If you do not agree with any of 
              these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          {/* Use License */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Use License</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <FileCheck className="w-6 h-6 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Permission</h3>
                  <p className="text-gray-600">
                    Permission is granted to temporarily access the materials on Iwanyu Store's website for 
                    personal, non-commercial transitory viewing only.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Restrictions</h3>
                  <p className="text-gray-600">
                    This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose</li>
                    <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* User Account */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Account</h2>
            <p className="text-gray-600 leading-relaxed">
              To access certain features of the website, you may be required to create an account. You are 
              responsible for maintaining the confidentiality of your account information and for all activities 
              that occur under your account.
            </p>
          </section>

          {/* Product Information */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Product Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Scale className="w-6 h-6 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Pricing and Availability</h3>
                  <p className="text-gray-600">
                    All prices are subject to change without notice. We reserve the right to modify or discontinue 
                    any product without notice. We shall not be liable to you or any third party for any 
                    modification, price change, suspension, or discontinuance of any product.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              In no event shall Iwanyu Store or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising out of 
              the use or inability to use the materials on our website.
            </p>
          </section>

          {/* Governing Law */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of Rwanda 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
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

export default TermsOfService; 