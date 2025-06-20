import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Phone, 
  Mail, 
  Clock,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  MessageSquare,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { chatbotConfig, chatbotResponses } from '../config/chatbot';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  response: string;
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{
    name?: string;
    interests?: string[];
    previousTopics?: string[];
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const openWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${chatbotConfig.whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  // AI Learning and Personalization
  const updateUserPreferences = (message: string, intent: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Extract name if mentioned
    const nameMatch = lowerMessage.match(/(?:my name is|i'm|i am|call me) (\w+)/);
    if (nameMatch) {
      setUserPreferences(prev => ({ ...prev, name: nameMatch[1] }));
    }
    
    // Track interests based on intent
    const interestMap: { [key: string]: string } = {
      'ordering': 'shopping',
      'delivery': 'delivery',
      'payment': 'payments',
      'vendor': 'selling',
      'technical': 'technical_support',
      'promotions': 'deals'
    };
    
    if (interestMap[intent]) {
      setUserPreferences(prev => ({
        ...prev,
        interests: [...(prev.interests || []), interestMap[intent]].slice(-5), // Keep last 5 interests
        previousTopics: [...(prev.previousTopics || []), intent].slice(-10) // Keep last 10 topics
      }));
    }
  };

  // Personalized greeting based on user history
  const getPersonalizedGreeting = (): string => {
    const { name, interests, previousTopics } = userPreferences;
    
    if (name) {
      if (interests && interests.length > 0) {
        const topInterest = interests[interests.length - 1];
        return `Welcome back, ${name}! 👋 I remember you were interested in ${topInterest}. How can I help you today?`;
      }
      return `Welcome back, ${name}! 👋 Great to see you again! How can I assist you today?`;
    }
    
    if (previousTopics && previousTopics.length > 0) {
      return `Welcome back! 👋 I see you've been exploring our services. What would you like to know more about today?`;
    }
    
    return chatbotResponses.greeting;
  };

  const quickActions: QuickAction[] = [
    {
      label: "How to order?",
      icon: <ShoppingCart size={16} />,
      response: chatbotResponses.orderHelp,
      actions: [
        {
          label: "Contact Support",
          action: () => openWhatsApp("I need help with placing an order"),
          icon: <MessageSquare size={14} />
        }
      ]
    },
    {
      label: "Track my order",
      icon: <Package size={16} />,
      response: chatbotResponses.trackOrder,
      actions: [
        {
          label: "WhatsApp Order Status",
          action: () => openWhatsApp("I want to track my order. My order number is: "),
          icon: <MessageSquare size={14} />
        }
      ]
    },
    {
      label: "Payment methods",
      icon: <CreditCard size={16} />,
      response: chatbotResponses.paymentInfo,
      actions: [
        {
          label: "Payment Issues",
          action: () => openWhatsApp("I'm having trouble with payment"),
          icon: <MessageSquare size={14} />
        }
      ]
    },
    {
      label: "Delivery info",
      icon: <Truck size={16} />,
      response: chatbotResponses.deliveryInfo,
      actions: [
        {
          label: "Check Delivery Area",
          action: () => openWhatsApp("I want to check if you deliver to my area: "),
          icon: <MessageSquare size={14} />
        }
      ]
    },
    {
      label: "Return policy",
      icon: <RotateCcw size={16} />,
      response: chatbotResponses.returnInfo,
      actions: [
        {
          label: "Start Return Process",
          action: () => openWhatsApp("I want to return an item. Order number: "),
          icon: <MessageSquare size={14} />
        }
      ]
    },
    {
      label: "Talk to human",
      icon: <MessageSquare size={16} />,
      response: chatbotResponses.humanSupport,
      actions: [
        {
          label: "WhatsApp Support",
          action: () => openWhatsApp("Hello! I need assistance with my inquiry."),
          icon: <MessageSquare size={14} />
        },
        {
          label: "Email Support",
          action: () => window.open(`mailto:${chatbotConfig.supportEmail}?subject=Support Request`),
          icon: <Mail size={14} />
        },
        {
          label: "Call Now",
          action: () => window.open(`tel:${chatbotConfig.hotlineNumber}`),
          icon: <Phone size={14} />
        }
      ]
    }
  ];

  const addMessage = (text: string, isBot: boolean, actions?: Message['actions']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      actions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleQuickAction = (action: QuickAction) => {
    addMessage(action.label, false);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(action.response, true, action.actions);
    }, 1000);
  };

  const getAIResponse = (message: string, conversationHistory: Message[]): { text: string; actions?: Message['actions'] } => {
    const lowerMessage = message.toLowerCase();
    const { faq, company, delivery, paymentMethods, returnPolicy, vendorInfo, policies, promotions } = chatbotConfig;
    
    // Analyze conversation context
    const recentMessages = conversationHistory.slice(-5);
    const userMessages = recentMessages.filter(m => !m.isBot).map(m => m.text.toLowerCase());
    const lastBotMessage = recentMessages.filter(m => m.isBot).pop()?.text || '';
    
    // Enhanced keyword extraction and intent detection
    const extractKeywords = (text: string): string[] => {
      const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'];
      return text.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word));
    };
    
    const keywords = extractKeywords(lowerMessage);
    
    // Intent classification with confidence scoring
    const intents = {
      greeting: { keywords: ['hello', 'hi', 'hey', 'good', 'morning', 'afternoon', 'evening'], confidence: 0 },
      ordering: { keywords: ['order', 'buy', 'purchase', 'cart', 'checkout', 'shopping'], confidence: 0 },
      delivery: { keywords: ['delivery', 'shipping', 'deliver', 'ship', 'arrive', 'when', 'time'], confidence: 0 },
      payment: { keywords: ['payment', 'pay', 'money', 'card', 'mobile', 'bank', 'cost', 'price'], confidence: 0 },
      tracking: { keywords: ['track', 'status', 'where', 'progress', 'update'], confidence: 0 },
      returns: { keywords: ['return', 'refund', 'exchange', 'back', 'unsatisfied', 'wrong'], confidence: 0 },
      vendor: { keywords: ['sell', 'seller', 'vendor', 'store', 'business', 'merchant'], confidence: 0 },
      support: { keywords: ['help', 'support', 'problem', 'issue', 'contact', 'assistance'], confidence: 0 },
      company: { keywords: ['iwanyu', 'about', 'company', 'owner', 'who', 'what'], confidence: 0 },
      technical: { keywords: ['login', 'password', 'account', 'app', 'website', 'bug', 'error'], confidence: 0 },
      promotions: { keywords: ['discount', 'promo', 'offer', 'deal', 'sale', 'coupon'], confidence: 0 }
    };
    
    // Calculate intent confidence scores
    Object.keys(intents).forEach(intent => {
      const intentKeywords = intents[intent as keyof typeof intents].keywords;
      const matches = keywords.filter(keyword => 
        intentKeywords.some(intentKeyword => 
          keyword.includes(intentKeyword) || intentKeyword.includes(keyword)
        )
      );
      intents[intent as keyof typeof intents].confidence = matches.length / Math.max(keywords.length, 1);
    });
    
    // Find the highest confidence intent
    const topIntent = Object.entries(intents).reduce((a, b) => 
      intents[a[0] as keyof typeof intents].confidence > intents[b[0] as keyof typeof intents].confidence ? a : b
    )[0];
    
    const confidence = intents[topIntent as keyof typeof intents].confidence;
    
    // Context-aware responses based on conversation flow
    if (lastBotMessage.includes('How can I help') && confidence < 0.2) {
      return {
        text: "I understand you're looking for assistance! Let me help you with some common topics:\n\n🛍️ **Shopping**: Browse products, place orders, checkout process\n🚚 **Delivery**: Shipping times, tracking, delivery areas\n💳 **Payments**: Payment methods, security, billing\n🔄 **Returns**: Return policy, refunds, exchanges\n🏪 **Selling**: Become a vendor, manage your store\n📞 **Support**: Contact our team, account help\n\nWhat would you like to know more about?",
        actions: [
          {
            label: "Browse Products",
            action: () => window.open('/products', '_blank'),
            icon: <ShoppingBag size={16} />
          },
          {
            label: "Contact Support",
            action: () => openWhatsApp("Hello! I need help with my inquiry."),
            icon: <MessageSquare size={16} />
          }
        ]
      };
    }
    
    // Advanced FAQ matching with fuzzy search
    const allFaqs = [
      ...faq.general,
      ...faq.orders,
      ...faq.vendor,
      ...faq.payments,
      ...faq.returns,
      ...faq.technical,
      ...faq.policies,
      ...faq.promotions
    ];
    
    const findBestFaqMatch = (query: string): { q: string; a: string } | null => {
      let bestMatch: { q: string; a: string } | null = null;
      let bestScore = 0;
      
      allFaqs.forEach(faqItem => {
        const questionWords = extractKeywords(faqItem.q.toLowerCase());
        const answerWords = extractKeywords(faqItem.a.toLowerCase());
        const queryWords = extractKeywords(query);
        
        // Calculate similarity score
        const qScore = queryWords.filter(word => 
          questionWords.some(qWord => qWord.includes(word) || word.includes(qWord))
        ).length / Math.max(queryWords.length, 1);
        
        const aScore = queryWords.filter(word => 
          answerWords.some(aWord => aWord.includes(word) || word.includes(aWord))
        ).length / Math.max(queryWords.length, 1);
        
        const totalScore = (qScore * 0.7) + (aScore * 0.3);
        
        if (totalScore > bestScore && totalScore > 0.3) {
          bestScore = totalScore;
          bestMatch = faqItem;
        }
      });
      
      return bestMatch;
    };
    
    const faqMatch = findBestFaqMatch(lowerMessage);
    if (faqMatch) {
      return { 
        text: `${faqMatch.a}\n\n💡 **Need more help?** I can assist with related topics or connect you with our support team.`,
        actions: [
          {
            label: "More Questions",
            action: () => {},
            icon: <MessageCircle size={16} />
          },
          {
            label: "WhatsApp Support",
            action: () => openWhatsApp(`I have a question about: ${faqMatch.q}`),
            icon: <MessageSquare size={16} />
          }
        ]
      };
    }
    
    // Intent-based intelligent responses
    if (confidence > 0.3) {
      switch (topIntent) {
        case 'greeting':
          const greetings = [
            `Hello! 👋 Welcome to ${company.name}! I'm your AI shopping assistant.`,
            `Hi there! 🌟 Great to see you at ${company.name}! How can I make your shopping experience amazing today?`,
            `Hey! 😊 Welcome to ${company.name} - ${company.description.split('.')[0]}. What can I help you discover?`
          ];
          return {
            text: greetings[Math.floor(Math.random() * greetings.length)] + "\n\nI can help you with:\n• Finding products\n• Order assistance\n• Delivery information\n• Payment options\n• Becoming a seller\n\nWhat interests you most?",
            actions: [
              {
                label: "Shop Now",
                action: () => window.open('/products', '_blank'),
                icon: <ShoppingBag size={16} />
              }
            ]
          };
          
        case 'ordering':
          return {
            text: "🛒 **Ready to shop?** Here's how easy it is:\n\n**Step 1:** Browse our amazing products\n**Step 2:** Add favorites to your cart\n**Step 3:** Secure checkout in minutes\n**Step 4:** Choose your payment method\n**Step 5:** Confirm and relax!\n\n✨ **Pro tip:** Create an account for faster checkout and order tracking!",
            actions: [
              {
                label: "Start Shopping",
                action: () => window.open('/products', '_blank'),
                icon: <ShoppingBag size={16} />
              },
              {
                label: "View Cart",
                action: () => window.open('/cart', '_blank'),
                icon: <Package size={16} />
              }
            ]
          };
          
        case 'delivery':
          return {
            text: `🚚 **Delivery Made Simple!**\n\n⏱️ **Timeframe:** ${delivery.timeframe}\n📍 **Coverage:** ${company.location}\n📦 **Tracking:** ${delivery.trackingAvailable ? 'Real-time tracking available!' : 'Updates via SMS/email'}\n💰 **Fees:** ${delivery.feeInfo}\n\n🎯 **Fast, reliable, and secure delivery to your doorstep!**`,
            actions: [
              {
                label: "Track Order",
                action: () => window.open('/orders', '_blank'),
                icon: <Package size={16} />
              }
            ]
          };
          
        case 'payment':
          return {
            text: `💳 **Secure Payment Options:**\n\n${paymentMethods.map(method => `✅ ${method}`).join('\n')}\n\n🔒 **100% Secure:** All transactions are encrypted and protected\n💡 **Tip:** Mobile Money is the fastest option for instant confirmation!`,
            actions: [
              {
                label: "Payment Help",
                action: () => openWhatsApp("I need help with payment options"),
                icon: <MessageSquare size={16} />
              }
            ]
          };
          
        case 'vendor':
          return {
            text: `🏪 **Start Your Business Journey!**\n\n🎯 **Why Choose ${company.name}?**\n• ${vendorInfo.registrationFee}\n• ${vendorInfo.commission}\n• ${vendorInfo.canManageFromApp ? 'Full mobile app management' : 'Easy management tools'}\n• ${vendorInfo.paymentSchedule} payments\n\n🚀 **Join thousands of successful sellers today!**`,
            actions: [
              {
                label: "Start Selling",
                action: () => window.open('/seller/register', '_blank'),
                icon: <ShoppingBag size={16} />
              },
              {
                label: "Seller Support",
                action: () => openWhatsApp("I want to become a seller on Iwanyu"),
                icon: <MessageSquare size={16} />
              }
            ]
          };
          
        case 'returns':
          return {
            text: `🔄 **Hassle-Free Returns**\n\n⏰ **Return Window:** ${returnPolicy.window}\n💰 **Shipping:** ${returnPolicy.returnShippingCost}\n🛡️ **Protection:** ${policies.refundPolicy}\n\n📝 **Easy Process:** Go to 'My Orders' → Select item → Request return`,
            actions: [
              {
                label: "My Orders",
                action: () => window.open('/orders', '_blank'),
                icon: <Package size={16} />
              },
              {
                label: "Return Help",
                action: () => openWhatsApp("I need help with a return"),
                icon: <MessageSquare size={16} />
              }
            ]
          };
          
        case 'promotions':
          return {
            text: `🎉 **Amazing Deals Await!**\n\n💰 **Current Offers:** ${promotions.hasDiscounts ? 'Check our latest discounts!' : 'New deals coming soon!'}\n🎁 **Referral Program:** ${promotions.referralProgram}\n📱 **Stay Updated:** ${promotions.socialMediaUpdates ? 'Follow us on social media for exclusive deals!' : 'Enable notifications for deals!'}\n\n✨ **More savings, more shopping!**`,
            actions: [
              {
                label: "View Deals",
                action: () => window.open('/deals', '_blank'),
                icon: <ShoppingBag size={16} />
              }
            ]
          };
          
        case 'company':
          return {
            text: `🌟 **About ${company.name}**\n\n👨‍💼 **Founded by:** ${company.owner}\n🌍 **Location:** ${company.location}\n📱 **Mobile App:** ${company.hasApp ? 'Available for iOS & Android' : 'Coming soon!'}\n\n💫 **Our Mission:** ${company.description}\n\n🎯 **We're committed to connecting buyers and sellers across Rwanda with quality products and exceptional service!**`
          };
          
        case 'support':
          return {
            text: `🤝 **We're Here to Help!**\n\n📧 **Email:** ${chatbotConfig.supportEmail}\n📞 **Phone:** ${chatbotConfig.hotlineNumber}\n💬 **WhatsApp:** Available 24/7\n\n🕒 **Business Hours:**\n• Weekdays: ${chatbotConfig.businessHours.weekdays}\n• Weekends: ${chatbotConfig.businessHours.weekends}\n\n⚡ **Fast response guaranteed!**`,
            actions: [
              {
                label: "WhatsApp Now",
                action: () => openWhatsApp("Hello! I need assistance with my inquiry."),
                icon: <MessageSquare size={16} />
              },
              {
                label: "Email Support",
                action: () => window.open(`mailto:${chatbotConfig.supportEmail}`, '_blank'),
                icon: <Mail size={16} />
              }
            ]
          };
          
        case 'technical':
          return {
            text: `🔧 **Technical Support**\n\n🚀 **Quick Fixes:**\n• **Login Issues:** Try password reset\n• **App Problems:** Update to latest version\n• **Website Issues:** Clear browser cache\n• **Payment Errors:** Check internet connection\n\n💡 **Still need help?** Our tech team is ready to assist!`,
            actions: [
              {
                label: "Tech Support",
                action: () => openWhatsApp("I'm having technical issues with the website/app"),
                icon: <MessageSquare size={16} />
              }
            ]
          };
      }
    }
    
    // Contextual follow-up questions
    const contextualResponses = [
      "I understand you're looking for information. Let me help you find exactly what you need! 🎯",
      "Great question! I'm here to make your Iwanyu experience smooth and enjoyable. 😊",
      "I'd love to assist you with that! Let me provide you with the best information. ✨"
    ];
    
    // Intelligent fallback with suggestions
    return {
      text: `${contextualResponses[Math.floor(Math.random() * contextualResponses.length)]}\n\n🤖 **I can help you with:**\n\n🛍️ **Shopping:** Product search, ordering, cart management\n🚚 **Delivery:** Shipping info, tracking, delivery areas\n💳 **Payments:** Payment methods, security, billing\n🔄 **Returns:** Return policy, refunds, exchanges\n🏪 **Selling:** Vendor registration, store management\n📞 **Support:** Contact options, account help\n\n💬 **Try asking:** "How do I place an order?" or "What are your delivery options?"`,
      actions: [
        {
          label: "Popular Products",
          action: () => window.open('/products', '_blank'),
          icon: <ShoppingBag size={16} />
        },
        {
          label: "Human Support",
          action: () => openWhatsApp(`I need help with: ${message}`),
          icon: <MessageSquare size={16} />
        },
        {
          label: "Browse Categories",
          action: () => window.open('/categories', '_blank'),
          icon: <Package size={16} />
        }
      ]
    };
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message
    addMessage(userMessage, false);
    
    // Show typing indicator with realistic delay
    setIsTyping(true);
    
    // AI processing with learning
    setTimeout(() => {
      const response = getAIResponse(userMessage, messages);
      
      // Extract intent for learning (simplified version)
      const lowerMessage = userMessage.toLowerCase();
      let detectedIntent = 'general';
      if (lowerMessage.includes('order') || lowerMessage.includes('buy')) detectedIntent = 'ordering';
      else if (lowerMessage.includes('delivery') || lowerMessage.includes('ship')) detectedIntent = 'delivery';
      else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) detectedIntent = 'payment';
      else if (lowerMessage.includes('sell') || lowerMessage.includes('vendor')) detectedIntent = 'vendor';
      else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) detectedIntent = 'returns';
      else if (lowerMessage.includes('discount') || lowerMessage.includes('promo')) detectedIntent = 'promotions';
      
      // Update AI learning
      updateUserPreferences(userMessage, detectedIntent);
      
      // Add AI response with personalization
      addMessage(response.text, true, response.actions);
      setIsTyping(false);
    }, Math.random() * 1000 + 800); // Realistic thinking time: 0.8-1.8 seconds
  };

  const initializeChat = () => {
    if (messages.length === 0) {
      setTimeout(() => {
        addMessage(getPersonalizedGreeting(), true);
      }, 500);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="text-white" size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="text-white" size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src="/iwanyu-logo.png" 
                    alt="Iwanyu Logo" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Fallback to Bot icon if logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <Bot size={20} className="hidden" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Iwanyu Assistant</h3>
                  <div className="flex items-center gap-1 text-sm opacity-90">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Online now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600 mb-3">Quick help:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.slice(0, 4).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-yellow-50 hover:border-yellow-300 transition-colors text-sm"
                  >
                    {action.icon}
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {message.isBot && (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-yellow-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        message.isBot
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                    
                    {message.actions && (
                      <div className="mt-2 space-y-1">
                        {message.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm w-full"
                          >
                            {action.icon}
                            <span>{action.label}</span>
                            <ExternalLink size={12} className="ml-auto opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {!message.isBot && (
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-yellow-600" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              
              <div className="mt-2 flex justify-center">
                <button
                  onClick={() => openWhatsApp("Hello! I need help with my inquiry.")}
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  <MessageSquare size={16} />
                  <span>Get instant help on WhatsApp</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot; 