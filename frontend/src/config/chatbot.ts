export const chatbotConfig = {
  // Contact Information
  whatsappNumber: "+250794306915", // Updated WhatsApp business number
  supportEmail: "support@iwanyu.store",
  hotlineNumber: "+250 78X XXX XXX", // Replace with actual number
  
  // Business Hours
  businessHours: {
    weekdays: "8:00 AM - 8:00 PM",
    weekends: "9:00 AM - 6:00 PM",
    timezone: "CAT (Central Africa Time)"
  },
  
  // Company Information
  company: {
    name: "Iwanyu",
    owner: "Davy Dushimiyimana",
    description: "An online marketplace where you can shop and sell quality products from various trusted vendors across Rwanda",
    location: "Rwanda (expanding to other regions soon)",
    hasApp: true
  },
  
  // Delivery Information
  delivery: {
    timeframe: "1-3 working days",
    feeInfo: "Delivery fees vary based on your location and vendor. It will be shown at checkout.",
    trackingAvailable: true
  },
  
  // Payment Methods
  paymentMethods: [
    "Mobile Money (MTN & Airtel)",
    "Bank transfers", 
    "Cash on delivery (where available)"
  ],
  
  // Return Policy
  returnPolicy: {
    window: "3 days after delivery",
    eligibleProducts: true,
    returnShippingCost: "Customer pays (except for damaged/wrong items)"
  },
  
  // Vendor Information
  vendorInfo: {
    registrationFee: "No upfront registration fee",
    commission: "Small commission per sale",
    paymentSchedule: "Weekly or upon request",
    canManageFromApp: true
  },
  
  // Policies
  policies: {
    buyerProtection: true,
    genuineProducts: "We verify all vendors and encourage genuine listings",
    refundPolicy: "If you don't receive your item or it's not as described, we ensure you get a refund"
  },
  
  // Promotions
  promotions: {
    hasDiscounts: true,
    referralProgram: "Invite friends and earn shopping vouchers when they make their first order",
    socialMediaUpdates: true
  },
  
  // FAQ Knowledge Base
  faq: {
    general: [
      {
        q: "What is Iwanyu?",
        a: "Iwanyu is an online marketplace where you can shop and sell quality products from various trusted vendors across Rwanda."
      },
      {
        q: "Who owns Iwanyu?",
        a: "Iwanyu is proudly owned and managed by Davy Dushimiyimana."
      },
      {
        q: "Where does Iwanyu operate?",
        a: "We currently operate in Rwanda and are expanding to other regions soon."
      },
      {
        q: "Is there a mobile app for Iwanyu?",
        a: "Yes! You can shop or manage your store easily through our Iwanyu mobile app."
      }
    ],
    orders: [
      {
        q: "How do I place an order?",
        a: "Simply browse products, click 'Add to Cart', then go to checkout and fill in your details to confirm."
      },
      {
        q: "How long does delivery take?",
        a: "Most orders are delivered within 1-3 working days, depending on your location."
      },
      {
        q: "Can I track my order?",
        a: "Yes! Once your order is confirmed, you'll receive a tracking link or code to monitor progress."
      },
      {
        q: "How much is the delivery fee?",
        a: "Delivery fees vary based on your location and vendor. It will be shown at checkout."
      }
    ],
    vendor: [
      {
        q: "How can I become a seller on Iwanyu?",
        a: "Just go to the Vendor section on our app or website and register your store in a few easy steps."
      },
      {
        q: "Is there a fee to sell on Iwanyu?",
        a: "We charge a small commission per sale. No upfront registration fee!"
      },
      {
        q: "Can I manage my store from the mobile app?",
        a: "Yes, vendors can fully manage their store, orders, products, and chats right from the app."
      },
      {
        q: "How do I get paid as a seller?",
        a: "Payments are made to your preferred bank or mobile money account weekly or upon request."
      }
    ],
    payments: [
      {
        q: "What payment methods are accepted?",
        a: "We accept Mobile Money (MTN & Airtel), bank transfers, and cash on delivery (where available)."
      },
      {
        q: "Is it safe to pay online?",
        a: "Yes! Iwanyu uses secure payment gateways to protect all transactions."
      }
    ],
    returns: [
      {
        q: "Can I return a product if I'm not satisfied?",
        a: "Yes. We offer a return window of 3 days after delivery for eligible products."
      },
      {
        q: "How do I request a refund?",
        a: "Go to your Orders, select the item, and choose 'Request a Refund' or contact our support team."
      },
      {
        q: "Do I pay for return shipping?",
        a: "In most cases, yes. But if the item was damaged or wrong, we cover the cost."
      }
    ],
    technical: [
      {
        q: "I can't log in to my account, what should I do?",
        a: "Try resetting your password. If the issue persists, contact support for help."
      },
      {
        q: "The app is crashing or not working properly.",
        a: "Please update the app to the latest version or reinstall. Let us know if the issue continues."
      }
    ],
    policies: [
      {
        q: "Does Iwanyu have a buyer protection policy?",
        a: "Yes! If you don't receive your item or it's not as described, we ensure you get a refund."
      },
      {
        q: "Are products on Iwanyu original?",
        a: "We verify all vendors and encourage genuine listings. Report any suspicious product to us."
      }
    ],
    promotions: [
      {
        q: "Do you offer discounts or promotions?",
        a: "Yes! Follow our social media or enable notifications to never miss a deal."
      },
      {
        q: "Do you have a referral program?",
        a: "Yes! Invite friends to Iwanyu and earn shopping vouchers when they make their first order."
      }
    ]
  }
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