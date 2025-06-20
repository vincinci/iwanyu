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
      },
      {
        q: "What products can I find on Iwanyu?",
        a: "You can find electronics, fashion items, home goods, beauty products, sports equipment, books, and much more from trusted vendors."
      },
      {
        q: "How do I create an account?",
        a: "Click 'Sign Up' on our website or app, enter your details (name, email, phone), verify your account, and you're ready to shop!"
      },
      {
        q: "Is Iwanyu free to use?",
        a: "Yes! Creating an account and browsing products is completely free. You only pay when you make a purchase."
      },
      {
        q: "What languages does Iwanyu support?",
        a: "Currently, Iwanyu supports English and Kinyarwanda. We're working on adding French support soon."
      },
      {
        q: "How can I contact customer support?",
        a: "You can contact us via WhatsApp at +250794306915, email us at support@iwanyu.store, or use this chat for instant help."
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
      },
      {
        q: "Can I cancel my order?",
        a: "Yes, you can cancel orders within 30 minutes of placing them. After that, contact our support team for assistance."
      },
      {
        q: "What if my order is delayed?",
        a: "If your order is delayed beyond the expected delivery time, contact us immediately and we'll track it with the vendor."
      },
      {
        q: "Can I change my delivery address?",
        a: "You can change your delivery address within 1 hour of placing the order. Contact support for urgent changes."
      },
      {
        q: "Do you deliver nationwide in Rwanda?",
        a: "Yes, we deliver to all provinces in Rwanda. Delivery times may vary based on location."
      },
      {
        q: "Can I schedule a delivery time?",
        a: "Some vendors offer scheduled delivery. You'll see this option at checkout if available."
      },
      {
        q: "What happens if I'm not home during delivery?",
        a: "Our delivery team will call you. If unavailable, they'll attempt redelivery or arrange a pickup point."
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
      },
      {
        q: "What documents do I need to start selling?",
        a: "You need a valid National ID, business registration (if applicable), and bank account or mobile money details."
      },
      {
        q: "How do I add products to my store?",
        a: "In your vendor dashboard, click 'Add Product', upload photos, add descriptions, set prices, and publish."
      },
      {
        q: "Can I sell internationally?",
        a: "Currently, we focus on the Rwandan market, but we're planning international expansion soon."
      },
      {
        q: "How do I handle customer inquiries?",
        a: "Use our built-in messaging system to communicate directly with customers about their orders and questions."
      },
      {
        q: "What if a customer returns a product?",
        a: "Handle returns according to our policy. We'll guide you through the process and update payment accordingly."
      },
      {
        q: "Can I offer discounts and promotions?",
        a: "Yes! You can create discount codes, flash sales, and promotional offers through your vendor dashboard."
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
      },
      {
        q: "Can I pay with a credit card?",
        a: "Credit card payments are coming soon! Currently, we accept mobile money and bank transfers."
      },
      {
        q: "What if my payment fails?",
        a: "If payment fails, try again or use a different payment method. Contact support if the issue persists."
      },
      {
        q: "Do you store my payment information?",
        a: "We use secure, encrypted systems and don't store sensitive payment details on our servers."
      },
      {
        q: "Can I get a receipt for my purchase?",
        a: "Yes! You'll receive a digital receipt via email and SMS after every successful purchase."
      },
      {
        q: "What currencies do you accept?",
        a: "All transactions are in Rwandan Francs (RWF). We're working on multi-currency support."
      },
      {
        q: "Can I pay in installments?",
        a: "Installment payments are coming soon! Currently, full payment is required at checkout."
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
      },
      {
        q: "How long does it take to get my refund?",
        a: "Refunds are processed within 3-5 business days after we receive and verify the returned item."
      },
      {
        q: "What items cannot be returned?",
        a: "Perishable goods, customized items, underwear, and items damaged by misuse cannot be returned."
      },
      {
        q: "Can I exchange an item instead of returning it?",
        a: "Yes! Contact the vendor directly through our platform to arrange exchanges for size or color."
      },
      {
        q: "What if I received a damaged item?",
        a: "Contact us immediately with photos. We'll arrange a free return and full refund or replacement."
      },
      {
        q: "Do I need the original packaging to return?",
        a: "Yes, items should be in original condition with packaging, tags, and accessories included."
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
      },
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot Password' on the login page, enter your email, and follow the reset instructions sent to you."
      },
      {
        q: "Why can't I see my orders?",
        a: "Make sure you're logged into the correct account. If the problem persists, contact our technical support."
      },
      {
        q: "The website is loading slowly, what can I do?",
        a: "Check your internet connection, clear your browser cache, or try using a different browser."
      },
      {
        q: "How do I update my profile information?",
        a: "Go to 'My Account' > 'Profile Settings' to update your personal information, address, and preferences."
      },
      {
        q: "Can I use Iwanyu on multiple devices?",
        a: "Yes! Log in with the same account on any device - phone, tablet, or computer."
      },
      {
        q: "How do I enable notifications?",
        a: "In your account settings, go to 'Notifications' and choose which alerts you want to receive."
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
      },
      {
        q: "What is your privacy policy?",
        a: "We protect your personal data and never share it without consent. Read our full privacy policy on our website."
      },
      {
        q: "How do you handle disputes between buyers and sellers?",
        a: "We mediate disputes fairly, reviewing evidence from both parties to reach a resolution."
      },
      {
        q: "What happens if a vendor doesn't deliver?",
        a: "We'll contact the vendor and ensure delivery or provide a full refund if they can't fulfill the order."
      },
      {
        q: "Can I report a problematic vendor?",
        a: "Yes! Use the 'Report' feature on vendor profiles or contact support with details about the issue."
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
      },
      {
        q: "How do I use a discount code?",
        a: "Enter your discount code at checkout in the 'Promo Code' field before completing payment."
      },
      {
        q: "Do you have seasonal sales?",
        a: "Yes! We have special sales during holidays, back-to-school season, and other major events."
      },
      {
        q: "Can I combine multiple discount codes?",
        a: "Usually, only one discount code can be used per order, but some special promotions may allow combinations."
      },
      {
        q: "How do I earn loyalty points?",
        a: "Our loyalty program is coming soon! You'll earn points for purchases, reviews, and referrals."
      }
    ],
    shipping: [
      {
        q: "What are your delivery areas?",
        a: "We deliver throughout Rwanda including Kigali, Huye, Musanze, Rubavu, Rusizi, and all other districts."
      },
      {
        q: "Do you offer same-day delivery?",
        a: "Same-day delivery is available in Kigali for orders placed before 2 PM, subject to vendor availability."
      },
      {
        q: "How is delivery fee calculated?",
        a: "Delivery fees depend on your location, package size, and weight. The exact fee is shown at checkout."
      },
      {
        q: "Can I pick up my order instead of delivery?",
        a: "Some vendors offer pickup options. You'll see this choice at checkout if available."
      },
      {
        q: "What if my package is lost during delivery?",
        a: "We'll investigate with our delivery partners and provide a replacement or full refund."
      }
    ],
    account: [
      {
        q: "How do I delete my account?",
        a: "Contact our support team to request account deletion. We'll process it within 48 hours."
      },
      {
        q: "Can I have multiple accounts?",
        a: "Each person should have only one account. Multiple accounts may be flagged and suspended."
      },
      {
        q: "How do I change my email address?",
        a: "Go to Account Settings > Personal Information to update your email address."
      },
      {
        q: "What if I forgot my username?",
        a: "You can log in using your email address or phone number instead of username."
      }
    ]
  },
  
  // Enhanced greeting system with casual greetings
  greetings: [
    "Hi there! 👋 Welcome to Iwanyu! I'm your personal shopping assistant. How can I help you today?",
    "Hello! 🌟 I'm here to help you with anything about Iwanyu - shopping, selling, orders, or general questions. What would you like to know?",
    "Welcome to Iwanyu! 🛍️ I'm your AI assistant ready to help with shopping, tracking orders, or answering any questions. How can I assist you?",
    "Hi! 😊 Great to see you at Iwanyu! Whether you're looking to shop, sell, or need support, I'm here to help. What can I do for you?",
    "Hello and welcome! 🎉 I'm your Iwanyu assistant. I can help you find products, track orders, answer questions about selling, or connect you with support. What interests you?"
  ],
  
  // Casual greetings responses
  casualGreetings: [
    "Hey! 👋 What's up? How can I help you with Iwanyu today?",
    "Hi there! 😊 What brings you to Iwanyu? Looking to shop or need some help?",
    "Hello! 🙂 What's going on? Need help with anything on Iwanyu?",
    "Hey hey! 👋 What can I do for you today?",
    "Hi! 😄 What's happening? How can I assist you with Iwanyu?",
    "Yo! 👋 What's up? Need help with shopping, selling, or something else?",
    "Hey there! 🤙 What's good? How can I help you out today?",
    "Hi! 🌟 What's new? Looking for something specific on Iwanyu?",
    "Hello! 👋 What's cooking? How can I make your Iwanyu experience better?",
    "Hey! 😊 What's the plan? Shopping, selling, or just browsing around?"
  ],
  
  // Predictive understanding patterns
  intentPatterns: {
    shopping: {
      keywords: ['buy', 'purchase', 'shop', 'looking for', 'want', 'need', 'find', 'search', 'product', 'item', 'stuff', 'thing', 'get', 'order'],
      casualPhrases: ['wanna buy', 'looking to get', 'trying to find', 'need some', 'want something', 'shopping for'],
      response: "I can help you find what you're looking for! 🛍️ What kind of product are you interested in? We have electronics, fashion, home goods, and much more from trusted vendors."
    },
    selling: {
      keywords: ['sell', 'vendor', 'store', 'business', 'make money', 'start selling', 'become seller', 'open shop'],
      casualPhrases: ['wanna sell', 'trying to make money', 'start a business', 'open my store'],
      response: "That's awesome! 🏪 Starting to sell on Iwanyu is easy and free. No registration fees, just a small commission per sale. Would you like me to guide you through the process?"
    },
    delivery: {
      keywords: ['delivery', 'shipping', 'transport', 'send', 'deliver', 'arrive', 'when', 'how long', 'fast'],
      casualPhrases: ['when will it arrive', 'how fast', 'quick delivery', 'same day'],
      response: "We deliver throughout Rwanda in 1-3 working days! 📦 Same-day delivery is available in Kigali for orders before 2 PM. Delivery fees vary by location and are shown at checkout."
    },
    payment: {
      keywords: ['pay', 'payment', 'money', 'cost', 'price', 'expensive', 'cheap', 'afford', 'momo', 'mobile money'],
      casualPhrases: ['how much', 'can I afford', 'too expensive', 'payment options'],
      response: "We accept Mobile Money (MTN & Airtel), bank transfers, and cash on delivery! 💳 All payments are secure. You can also filter products by price range to find what fits your budget."
    },
    problems: {
      keywords: ['problem', 'issue', 'help', 'stuck', 'error', 'not working', 'broken', 'cant', 'unable', 'difficult'],
      casualPhrases: ['having trouble', 'cant figure out', 'not working', 'need help'],
      response: "I'm here to help! 🤝 What specific issue are you facing? Whether it's with ordering, account access, payments, or anything else - let me know and I'll guide you through it."
    },
    account: {
      keywords: ['account', 'login', 'register', 'sign up', 'profile', 'password', 'forgot', 'username'],
      casualPhrases: ['cant login', 'forgot password', 'make account', 'sign me up'],
      response: "I can help with account issues! 👤 You can create a free account, reset passwords, or update your profile. What specifically do you need help with?"
    },
    tracking: {
      keywords: ['track', 'order', 'where', 'status', 'progress', 'location', 'delivered', 'shipped'],
      casualPhrases: ['where is my order', 'track my stuff', 'order status', 'has it shipped'],
      response: "You can track your order easily! 📍 Once confirmed, you'll get a tracking link. You can also check 'My Orders' in your account for real-time updates."
    }
  },
  
  // Casual conversation starters
  casualResponses: {
    whatsUp: [
      "Not much, just here helping awesome people like you! 😊 What's up with you? Need help with anything on Iwanyu?",
      "Just chillin' and ready to help! 🤙 What brings you here today?",
      "Living the AI life! 🤖 What can I help you with on Iwanyu?"
    ],
    howAreYou: [
      "I'm doing great, thanks for asking! 😊 How are you doing? What can I help you with today?",
      "Fantastic! Ready to help you with anything Iwanyu-related! 🌟 How can I assist you?",
      "I'm awesome, thanks! 😄 What about you? Looking for something specific?"
    ],
    thanks: [
      "You're welcome! 😊 Anything else I can help you with?",
      "No problem at all! 👍 Is there anything else you need help with?",
      "Happy to help! 🌟 Let me know if you need anything else!"
    ],
    bye: [
      "Goodbye! 👋 Thanks for visiting Iwanyu. Come back anytime you need help!",
      "See you later! 😊 Have a great day and happy shopping!",
      "Bye! 🌟 Don't hesitate to come back if you need any help with Iwanyu!"
    ]
  },
  
  // Context-aware responses
  contextResponses: {
    firstTime: "Welcome to Iwanyu! 🎉 Since this is your first time here, let me tell you that we're Rwanda's premier online marketplace where you can shop from trusted vendors or start your own store. What would you like to explore first?",
    returning: "Welcome back to Iwanyu! 👋 Great to see you again. How can I assist you today?",
    afterPurchase: "Thank you for your recent purchase! 🛍️ I can help you track your order, answer questions about delivery, or assist with anything else you need.",
    vendor: "Hello! 👨‍💼 I see you're interested in selling on Iwanyu. That's fantastic! I can guide you through the registration process, explain our commission structure, or answer any vendor-related questions."
  }
};

// Derived responses that use the config values
export const chatbotResponses = {
  greeting: chatbotConfig.greetings[Math.floor(Math.random() * chatbotConfig.greetings.length)],
  orderHelp: "To place an order:\n1. Browse our products\n2. Add items to cart\n3. Proceed to checkout\n4. Enter your details\n5. Choose payment method\n6. Confirm order\n\nNeed help with a specific step?",
  trackOrder: "You can track your order by:\n1. Going to 'My Orders' in your account\n2. Click on the order you want to track\n3. View real-time status updates\n\nDon't have an account? Contact us with your order number.",
  paymentInfo: `We accept:\n• ${chatbotConfig.paymentMethods.join('\n• ')}\n\nAll payments are secure and encrypted.`,
  deliveryInfo: `Delivery Information:\n• Timeframe: ${chatbotConfig.delivery.timeframe}\n• ${chatbotConfig.delivery.feeInfo}\n• Tracking: ${chatbotConfig.delivery.trackingAvailable ? 'Available' : 'Not available'}`,
  returnInfo: `Our Return Policy:\n• Return window: ${chatbotConfig.returnPolicy.window}\n• ${chatbotConfig.returnPolicy.returnShippingCost}\n• We ensure refunds for items not as described\n\nContact us to initiate a return.`,
  humanSupport: `I'll connect you with our support team! They're available:\n• Weekdays: ${chatbotConfig.businessHours.weekdays}\n• Weekends: ${chatbotConfig.businessHours.weekends}\n• Timezone: ${chatbotConfig.businessHours.timezone}\n\nChoose your preferred contact method:`
};

export default chatbotConfig; 