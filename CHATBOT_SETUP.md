# 🤖 ChatBot Setup Guide

Your Iwanyu store now has an intelligent chatbot that helps customers and directs them to WhatsApp support!

## 🎯 Features

- **Floating Chat Button**: Modern animated button in bottom-right corner
- **Quick Actions**: Pre-defined buttons for common queries
- **Smart Responses**: Intelligent answers about orders, delivery, payments, returns
- **WhatsApp Integration**: Seamless handoff to human support
- **Mobile Responsive**: Works perfectly on all devices
- **Professional UI**: Modern design with smooth animations

## ⚙️ Customization

To customize the chatbot for your business, edit the file:
`frontend/src/config/chatbot.ts`

### 📞 Contact Information
```typescript
whatsappNumber: "+250788123456", // Your WhatsApp Business number
supportEmail: "support@iwanyu.com", // Your support email
phoneNumber: "+250788123456", // Your phone number
```

### 🕒 Business Hours
```typescript
businessHours: {
  weekdays: "Monday - Friday: 8AM - 8PM",
  saturday: "Saturday: 9AM - 5PM", 
  sunday: "Sunday: 10AM - 4PM"
}
```

### 🚚 Delivery Settings
```typescript
delivery: {
  kigaliTime: "1-2 business days",
  otherCitiesTime: "2-3 business days",
  freeDeliveryThreshold: 50000, // RWF
  deliveryFee: 3000, // RWF
  deliveryDays: "Monday to Saturday, 8AM to 6PM"
}
```

### 💳 Payment Methods
```typescript
paymentMethods: [
  "Mobile Money (MTN, Airtel)",
  "Bank Transfer", 
  "Cash on Delivery",
  "Credit/Debit Cards"
]
```

## 🚀 How It Works

1. **Customer clicks chat button** → Opens chat interface
2. **Quick actions provided** → Common questions with instant answers
3. **Smart keyword detection** → Responds to typed messages
4. **WhatsApp handoff** → Connects to human support when needed
5. **Contact options** → WhatsApp, Email, or Phone support

## 📱 WhatsApp Integration

The bot automatically:
- Opens WhatsApp with pre-filled messages
- Includes context from the conversation
- Works on both mobile and desktop
- Uses your business WhatsApp number

## 🎨 Customizing Responses

Edit `chatbotResponses` in the config file to modify:
- Greeting message
- Order help instructions
- Delivery information
- Payment details
- Return policy
- Support handoff message

## 📈 Benefits

- **Instant Support**: 24/7 automated help
- **Reduced Support Load**: Answers common questions automatically
- **Better UX**: Smooth, professional customer experience
- **Lead Generation**: Captures inquiries and directs to WhatsApp
- **Mobile Optimized**: Perfect for mobile shoppers

## 🔧 Technical Notes

- Built with React + TypeScript
- Framer Motion animations
- Fully responsive design
- Configurable via single config file
- No external dependencies for chat functionality

Your customers can now get instant help and easily connect with your support team! 🎉 