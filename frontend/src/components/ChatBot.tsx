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
  ShoppingBag,
  Store
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const openWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${chatbotConfig.whatsappNumber.replace('+', '')}?text=${encodedMessage}`, '_blank');
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

  const getSmartResponse = (message: string): { text: string; actions?: Message['actions'] } => {
    const lowerMessage = message.toLowerCase();
    const { faq, company, delivery, paymentMethods, returnPolicy, vendorInfo, policies, promotions } = chatbotConfig;
    
    // Search through all FAQ categories including new ones
    const allFaqs = [
      ...faq.general,
      ...faq.orders,
      ...faq.vendor,
      ...faq.payments,
      ...faq.returns,
      ...faq.technical,
      ...faq.policies,
      ...faq.promotions,
      ...faq.shipping,
      ...faq.account
    ];
    
    // Enhanced FAQ matching with multiple strategies
    const matchingFaq = allFaqs.find(item => {
      const question = item.q.toLowerCase();
      const answer = item.a.toLowerCase();
      
      // Direct question match
      if (question.includes(lowerMessage) || lowerMessage.includes(question.slice(0, -1))) {
        return true;
      }
      
      // Keyword extraction and matching
      const messageWords = lowerMessage.split(' ').filter(word => word.length > 2);
      const questionWords = question.split(' ').filter(word => word.length > 2);
      
      const matchCount = messageWords.filter(word => 
        questionWords.some(qWord => qWord.includes(word) || word.includes(qWord))
      ).length;
      
      // If 2 or more significant words match, consider it a match
      return matchCount >= 2;
    });
    
    if (matchingFaq) {
      return { text: matchingFaq.a };
    }
    
    // Enhanced keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const randomGreeting = chatbotConfig.greetings[Math.floor(Math.random() * chatbotConfig.greetings.length)];
      return { text: randomGreeting };
    }
    
    if (lowerMessage.includes('owner') || lowerMessage.includes('who owns') || lowerMessage.includes('founder')) {
      return { text: `Iwanyu is proudly owned and managed by ${company.owner}.` };
    }
    
    if (lowerMessage.includes('what is iwanyu') || lowerMessage.includes('about iwanyu') || lowerMessage.includes('tell me about')) {
      return { text: company.description };
    }
    
    if (lowerMessage.includes('app') || lowerMessage.includes('mobile') || lowerMessage.includes('download')) {
      return { text: "Yes! You can shop or manage your store easily through our Iwanyu mobile app. It's available for both customers and vendors." };
    }
    
    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping') || lowerMessage.includes('transport')) {
      return { 
        text: `Delivery takes ${delivery.timeframe}. ${delivery.feeInfo} You can track your order once it's confirmed!` 
      };
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('money')) {
      return { 
        text: `We accept: ${paymentMethods.join(', ')}. All payments are secure and protected.` 
      };
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
      return { 
        text: `You can return products within ${returnPolicy.window}. ${returnPolicy.returnShippingCost}. We ensure you get a refund if items aren't as described.` 
      };
    }
    
    if (lowerMessage.includes('sell') || lowerMessage.includes('vendor') || lowerMessage.includes('seller') || lowerMessage.includes('business')) {
      return { 
        text: `Becoming a seller is easy! ${vendorInfo.registrationFee}. We charge ${vendorInfo.commission}. You can manage everything from the app and get paid ${vendorInfo.paymentSchedule}.`,
        actions: [
          {
            label: "Start Selling Now",
            action: () => window.open('/seller/register', '_blank'),
            icon: <ShoppingBag size={16} />
          }
        ]
      };
    }
    
    if (lowerMessage.includes('discount') || lowerMessage.includes('promo') || lowerMessage.includes('offer') || lowerMessage.includes('sale')) {
      return { 
        text: `Yes! We regularly offer discounts and promotions. ${promotions.referralProgram}. Follow our social media to never miss a deal!` 
      };
    }
    
    if (lowerMessage.includes('track') || lowerMessage.includes('order status') || lowerMessage.includes('where is my order')) {
      return { 
        text: "You can track your order! Once confirmed, you'll receive a tracking link or code to monitor progress.",
        actions: [
          {
            label: "Track My Order",
            action: () => window.open('/orders', '_blank'),
            icon: <Package size={16} />
          }
        ]
      };
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('customer service')) {
      return { 
        text: `You can reach us at ${chatbotConfig.supportEmail} or call ${chatbotConfig.hotlineNumber}. We're here ${chatbotConfig.businessHours.weekdays} on weekdays and ${chatbotConfig.businessHours.weekends} on weekends.`,
        actions: [
          {
            label: "Email Support",
            action: () => window.open(`mailto:${chatbotConfig.supportEmail}`, '_blank'),
            icon: <Mail size={16} />
          }
        ]
      };
    }
    
    if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('login') || lowerMessage.includes('register')) {
      return {
        text: "I can help you with account-related questions! You can create an account for free, manage your profile, reset passwords, and more. What specifically do you need help with?",
        actions: [
          {
            label: "Create Account",
            action: () => window.open('/register', '_blank'),
            icon: <User size={16} />
          },
          {
            label: "Login Issues",
            action: () => openWhatsApp("I'm having trouble logging into my account"),
            icon: <MessageSquare size={16} />
          }
        ]
      };
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap')) {
      return {
        text: "We have products at various price points from different vendors. You can filter by price range, compare options, and find great deals. Would you like help finding something specific?",
        actions: [
          {
            label: "Browse Products",
            action: () => window.open('/products', '_blank'),
            icon: <ShoppingBag size={16} />
          }
        ]
      };
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where') || lowerMessage.includes('rwanda')) {
      return {
        text: `We operate throughout ${company.location}. We deliver to all provinces including Kigali, Huye, Musanze, Rubavu, Rusizi, and other districts. Where would you like us to deliver?`
      };
    }
    
    // Default response with comprehensive help options
    return {
      text: "I'm here to help! I can assist you with:\n\n🛍️ Shopping & Products\n📦 Orders & Delivery\n💳 Payments & Refunds\n🏪 Becoming a Seller\n👤 Account Management\n🎯 Promotions & Discounts\n🔧 Technical Support\n📞 Contact Information\n\nWhat would you like to know more about?",
      actions: [
        {
          label: "Browse Products",
          action: () => window.open('/products', '_blank'),
          icon: <ShoppingBag size={16} />
        },
        {
          label: "Start Selling",
          action: () => window.open('/seller/register', '_blank'),
          icon: <Store size={16} />
        },
        {
          label: "Contact Support",
          action: () => openWhatsApp("Hello! I need help with my inquiry."),
          icon: <MessageSquare size={16} />
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
    
    // Show typing indicator
    setIsTyping(true);
    
    // Get smart response
    setTimeout(() => {
      const response = getSmartResponse(userMessage);
      addMessage(response.text, true, response.actions);
      setIsTyping(false);
    }, 1000);
  };

  const initializeChat = () => {
    if (messages.length === 0) {
      setTimeout(() => {
        addMessage(chatbotResponses.greeting, true);
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