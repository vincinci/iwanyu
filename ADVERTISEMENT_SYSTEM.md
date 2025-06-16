# Advertisement System Documentation

## Overview

The Advertisement System allows sellers to pay ad fees to promote their products on the home page and at the top of search results, similar to platforms like Amazon, AliExpress, and eBay. This system provides a comprehensive advertising solution with campaign management, payment processing, click tracking, and performance analytics.

## Features

### 🎯 **Ad Campaign Management**
- Create and manage advertising campaigns
- Multiple ad types: Product Promotion, Brand Awareness, Category Boost, Flash Sale
- Various placement options: Home Banner, Home Featured, Search Top, Category Top
- Budget management with daily spending limits
- Campaign scheduling with start/end dates

### 💰 **Flexible Pricing Model**
- **Home Page Banner**: 500-1000 RWF per click (Premium placement)
- **Home Featured Section**: 300-600 RWF per click (High visibility)
- **Search Results Top**: 200-400 RWF per click (Targeted traffic)
- **Category Page Top**: 150-300 RWF per click (Category-specific)

### 📊 **Performance Tracking**
- Real-time click tracking with IP and user agent logging
- Impression counting for CTR calculation
- Budget monitoring and automatic campaign pausing
- Comprehensive analytics dashboard

### 🔄 **Smart Ad Serving**
- Bid-based ad ranking (higher bids get better placement)
- Active campaign filtering (only shows running campaigns)
- Budget-aware serving (pauses campaigns when budget exceeded)
- Placement-specific ad delivery

## Database Schema

### AdCampaign Model
```prisma
model AdCampaign {
  id            String      @id @default(cuid())
  sellerId      String
  name          String
  description   String?
  budget        Float
  dailyBudget   Float?
  bidAmount     Float       // Cost per click/impression
  status        AdStatus    @default(PENDING)
  adType        AdType
  placement     AdPlacement
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean     @default(true)
  totalSpent    Float       @default(0)
  totalClicks   Int         @default(0)
  totalImpressions Int      @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### Advertisement Model
```prisma
model Advertisement {
  id          String      @id @default(cuid())
  campaignId  String
  productId   String
  title       String
  description String?
  imageUrl    String?
  targetKeywords String[] @default([])
  priority    Int         @default(0)
  isActive    Boolean     @default(true)
  clicks      Int         @default(0)
  impressions Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

### AdPayment Model
```prisma
model AdPayment {
  id          String        @id @default(cuid())
  campaignId  String
  sellerId    String
  amount      Float
  paymentMethod String
  paymentReference String?
  status      PaymentStatus @default(PENDING)
  paidAt      DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

### AdClick Model
```prisma
model AdClick {
  id            String        @id @default(cuid())
  campaignId    String
  advertisementId String
  userId        String?
  ipAddress     String
  userAgent     String?
  clickedAt     DateTime      @default(now())
  cost          Float         // Cost deducted for this click
  placement     AdPlacement
}
```

## API Endpoints

### Campaign Management

#### Create Campaign
```http
POST /api/advertisements/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Sale Campaign",
  "description": "Promote summer products",
  "budget": 50000,
  "dailyBudget": 5000,
  "bidAmount": 500,
  "adType": "PRODUCT_PROMOTION",
  "placement": "HOME_FEATURED",
  "startDate": "2024-06-15T00:00:00Z",
  "endDate": "2024-07-15T23:59:59Z",
  "productIds": ["product1", "product2"]
}
```

#### Get Seller Campaigns
```http
GET /api/advertisements/campaigns
Authorization: Bearer <token>
```

#### Process Payment
```http
POST /api/advertisements/campaigns/{campaignId}/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "paymentMethod": "MOBILE_MONEY",
  "paymentReference": "TXN123456"
}
```

### Ad Serving

#### Get Home Page Ads
```http
GET /api/advertisements/home/{placement}?limit=5
```

#### Get Promoted Products for Search
```http
GET /api/advertisements/promoted-products?q=phone&categoryId=electronics&limit=3
```

#### Track Ad Click
```http
POST /api/advertisements/click/{adId}
```

### Pricing Information

#### Get Ad Pricing
```http
GET /api/advertisements/pricing
```

## Frontend Integration

### Home Page Integration

The home page automatically fetches and displays promoted products:

```typescript
// Fetch promoted products
useEffect(() => {
  const fetchPromotedProducts = async () => {
    try {
      const response = await advertisementApi.getHomePageAds('HOME_FEATURED', 6);
      if (response.success) {
        setPromotedProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching promoted products:', error);
    }
  };

  fetchPromotedProducts();
}, []);
```

### Click Tracking

All promoted product clicks are automatically tracked:

```typescript
const handlePromotedProductClick = async (product: PromotedProduct) => {
  // Track the click
  await advertisementApi.trackClick(product.adId);
  
  // Navigate to product page
  navigate(`/products/${product.id}`);
};
```

### Seller Dashboard

Sellers can manage their campaigns through the dedicated dashboard:

```typescript
import AdCampaigns from '../pages/seller/AdCampaigns';

// Route configuration
{
  path: '/seller/ad-campaigns',
  element: <AdCampaigns />,
  meta: { requiresAuth: true, requiresSeller: true }
}
```

## Business Logic

### Campaign Lifecycle

1. **Creation**: Seller creates campaign with products and budget
2. **Payment**: Campaign requires payment to be approved
3. **Approval**: Admin/system approves campaign (auto-approved after payment)
4. **Activation**: Campaign becomes active on start date
5. **Serving**: Ads are served based on bid amount and placement
6. **Tracking**: Clicks and impressions are tracked in real-time
7. **Budget Management**: Campaign pauses when budget is exhausted
8. **Completion**: Campaign ends on end date or when manually stopped

### Ad Ranking Algorithm

Ads are ranked and served based on:

1. **Bid Amount** (Primary factor)
2. **Campaign Status** (Active campaigns only)
3. **Budget Availability** (Campaigns with remaining budget)
4. **Date Range** (Within campaign start/end dates)
5. **Priority Score** (Manual priority setting)
6. **Relevance** (Keyword matching for search ads)

### Budget Management

- **Real-time Tracking**: Every click deducts from campaign budget
- **Automatic Pausing**: Campaigns pause when budget is exceeded
- **Daily Limits**: Optional daily budget caps
- **Overspend Protection**: Prevents campaigns from exceeding budget

## Performance Metrics

### Key Performance Indicators (KPIs)

- **Click-Through Rate (CTR)**: (Clicks / Impressions) × 100
- **Cost Per Click (CPC)**: Total Spent / Total Clicks
- **Return on Ad Spend (ROAS)**: Revenue / Ad Spend
- **Conversion Rate**: Orders / Clicks
- **Budget Utilization**: Spent / Total Budget

### Expected Performance

- **CTR**: 2-5% (industry average: 2%)
- **CPC**: 150-1000 RWF depending on placement
- **ROAS**: 3:1 to 5:1 (300-500% return)
- **Conversion Rate**: 1-3%

## Revenue Model

### Platform Revenue Streams

1. **Ad Spend Commission**: 10-15% of total ad spend
2. **Setup Fees**: One-time campaign setup fee
3. **Premium Features**: Advanced targeting, analytics
4. **Minimum Spend**: Monthly minimum ad spend requirements

### Projected Revenue

- **Monthly Ad Spend**: $10,000-50,000
- **Platform Commission**: $1,000-7,500/month
- **Annual Revenue**: $12,000-90,000

## Testing

### API Testing

```bash
# Test campaign creation
curl -X POST http://localhost:3001/api/advertisements/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "budget": 10000,
    "bidAmount": 500,
    "adType": "PRODUCT_PROMOTION",
    "placement": "HOME_FEATURED",
    "startDate": "2024-06-15T00:00:00Z",
    "endDate": "2024-07-15T23:59:59Z",
    "productIds": ["product1"]
  }'

# Test ad serving
curl http://localhost:3001/api/advertisements/home/HOME_FEATURED?limit=5

# Test click tracking
curl -X POST http://localhost:3001/api/advertisements/click/ad123
```

### Frontend Testing

```bash
# Start development server
cd frontend
npm run dev

# Test promoted products display
# Navigate to home page and verify sponsored products section

# Test click tracking
# Click on sponsored products and verify tracking in network tab
```

## Security Considerations

### Authentication & Authorization

- **Seller Verification**: Only approved sellers can create campaigns
- **Payment Verification**: Campaigns require valid payment
- **Click Fraud Prevention**: IP-based duplicate click detection
- **Budget Protection**: Real-time budget monitoring

### Data Privacy

- **User Consent**: Click tracking respects user privacy
- **Data Retention**: Click data retained for analytics only
- **GDPR Compliance**: User data handling follows privacy regulations

## Monitoring & Analytics

### System Monitoring

- **Campaign Performance**: Real-time dashboard
- **Budget Alerts**: Notifications when budget is low
- **Click Fraud Detection**: Unusual click pattern alerts
- **Revenue Tracking**: Platform commission monitoring

### Business Intelligence

- **Seller Analytics**: Campaign performance insights
- **Platform Metrics**: Overall ad system performance
- **Revenue Reports**: Commission and fee tracking
- **User Behavior**: Click patterns and conversion data

## Future Enhancements

### Phase 2 Features

1. **Advanced Targeting**
   - Demographic targeting
   - Geographic targeting
   - Behavioral targeting
   - Lookalike audiences

2. **Dynamic Pricing**
   - Real-time bid adjustments
   - Competitive bidding
   - Seasonal pricing
   - Performance-based pricing

3. **Enhanced Analytics**
   - Conversion tracking
   - Attribution modeling
   - A/B testing
   - Predictive analytics

4. **Automation**
   - Auto-bidding strategies
   - Budget optimization
   - Campaign automation
   - Smart recommendations

### Phase 3 Features

1. **Video Ads**
2. **Retargeting Campaigns**
3. **Cross-platform Integration**
4. **AI-powered Optimization**

## Support & Documentation

### Seller Resources

- **Campaign Setup Guide**: Step-by-step campaign creation
- **Best Practices**: Optimization tips and strategies
- **Troubleshooting**: Common issues and solutions
- **API Documentation**: Technical integration guide

### Support Channels

- **Email Support**: ads@iwanyu.store
- **Live Chat**: Available during business hours
- **Knowledge Base**: Comprehensive FAQ and guides
- **Video Tutorials**: Campaign setup and optimization

## Conclusion

The Advertisement System provides a comprehensive solution for sellers to promote their products and for the platform to generate additional revenue. With features like campaign management, performance tracking, and smart ad serving, it offers a competitive advertising platform that can significantly boost seller sales and platform profitability.

The system is designed to be scalable, secure, and user-friendly, providing value to both sellers and customers while maintaining a positive user experience on the platform. 