export const chatbotConfig = {
  // Contact Information
  whatsappNumber: "+250788123456", // Replace with your actual WhatsApp number
  supportEmail: "support@iwanyu.com", // Replace with your actual email
  phoneNumber: "+250788123456", // Replace with your actual phone number
  
  // Business Hours
  businessHours: {
    weekdays: "Monday - Friday: 8AM - 8PM",
    saturday: "Saturday: 9AM - 5PM", 
    sunday: "Sunday: 10AM - 4PM"
  },
  
  // Delivery Information
  delivery: {
    kigaliTime: "1-2 business days",
    otherCitiesTime: "2-3 business days",
    freeDeliveryThreshold: 50000, // RWF
    deliveryFee: 3000, // RWF
    deliveryDays: "Monday to Saturday, 8AM to 6PM"
  },
  
  // Return Policy
  returnPolicy: {
    returnWindow: "7 days",
    condition: "Items must be unused and in original packaging",
    freeReturns: "Free returns for defective items",
    returnShippingNote: "Return shipping fee applies for change of mind"
  },
  
  // Payment Methods
  paymentMethods: [
    "Mobile Money (MTN, Airtel)",
    "Bank Transfer", 
    "Cash on Delivery",
    "Credit/Debit Cards"
  ]
};

// Derived responses that use the config values
export const chatbotResponses = {
  greeting: "Hi there! 👋 I'm your Iwanyu assistant. How can I help you today?",
  orderHelp: "To place an order:\n1. Browse our products\n2. Add items to cart\n3. Proceed to checkout\n4. Enter your details\n5. Choose payment method\n6. Confirm order\n\nNeed help with a specific step?",
  trackOrder: "You can track your order by:\n1. Going to 'My Orders' in your account\n2. Click on the order you want to track\n3. View real-time status updates\n\nDon't have an account? Contact us with your order number.",
  paymentInfo: `We accept:\n• ${chatbotConfig.paymentMethods.join('\n• ')}\n\nAll payments are secure and encrypted.`,
  deliveryInfo: `Delivery Information:\n• Kigali: ${chatbotConfig.delivery.kigaliTime}\n• Other cities: ${chatbotConfig.delivery.otherCitiesTime}\n• Free delivery on orders over ${chatbotConfig.delivery.freeDeliveryThreshold.toLocaleString()} RWF\n• Delivery fee: ${chatbotConfig.delivery.deliveryFee.toLocaleString()} RWF\n\nWe deliver ${chatbotConfig.delivery.deliveryDays}.`,
  returnInfo: `Our Return Policy:\n• ${chatbotConfig.returnPolicy.returnWindow} return window\n• ${chatbotConfig.returnPolicy.condition}\n• ${chatbotConfig.returnPolicy.freeReturns}\n• ${chatbotConfig.returnPolicy.returnShippingNote}\n\nContact us to initiate a return.`,
  humanSupport: `I'll connect you with our support team! They're available:\n• ${chatbotConfig.businessHours.weekdays}\n• ${chatbotConfig.businessHours.saturday}\n• ${chatbotConfig.businessHours.sunday}\n\nChoose your preferred contact method:`
};

export default chatbotConfig; 