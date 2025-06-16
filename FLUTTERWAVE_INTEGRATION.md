# Flutterwave Payment Integration

This document provides comprehensive information about the Flutterwave payment integration in your ecommerce store, including payment processing and seller payouts.

## 🚀 Setup Complete

Your Flutterwave payment integration has been successfully configured with the following components:

### ✅ Environment Variables
The following Flutterwave credentials have been added to `backend/.env`:
```env
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-80beae9a1e1463654d41a8e4d00515dd-X"
FLUTTERWAVE_SECRET_KEY="FLWSECK-cc842f4c47bf0059d3854bf053c11296-1973d2d141dvt-X"
FLUTTERWAVE_ENCRYPTION_KEY="cc842f4c47bf3f882628801e"
```

### ✅ Dependencies Installed
- `flutterwave-node-v3` - Official Flutterwave Node.js SDK

### ✅ Files Created/Updated
- `backend/src/utils/flutterwave.ts` - Flutterwave service utility (enhanced with transfer capabilities)
- `backend/src/types/flutterwave.d.ts` - TypeScript declarations
- `backend/src/routes/payments.ts` - Payment API routes
- `backend/src/routes/payouts.ts` - **NEW: Seller payout API routes**
- `backend/src/routes/orders.ts` - Order management routes
- `backend/src/index.ts` - Added payment and payout routes to server
- `backend/prisma/schema.prisma` - **NEW: Added SellerPayout model**
- `test-flutterwave-integration.sh` - Integration test script

## 📚 API Endpoints

### Payment Endpoints

#### 1. Initialize Payment
```http
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id_here",
  "redirectUrl": "https://yoursite.com/payment/callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "paymentUrl": "https://checkout.flutterwave.com/...",
    "paymentReference": "ORDER_1234567890_abc123",
    "orderId": "order_id_here"
  }
}
```

#### 2. Verify Payment
```http
GET /api/payments/verify/:transactionId
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "order_id",
    "paymentStatus": "completed",
    "transactionId": 12345,
    "amount": 10000,
    "currency": "RWF",
    "customerEmail": "customer@domain.com"
  }
}
```

#### 3. Payment Webhook
```http
POST /api/payments/webhook
Content-Type: application/json
verif-hash: <flutterwave_signature>

{
  "event": "charge.completed",
  "data": {
    "status": "successful",
    "tx_ref": "ORDER_1234567890_abc123",
    ...
  }
}
```

#### 4. Get Payment Status
```http
GET /api/payments/status/:orderId
Authorization: Bearer <token>
```

#### 5. Process Refund (Admin Only)
```http
POST /api/payments/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "orderId": "order_id_here",
  "reason": "Customer request"
}
```

### 💰 **NEW: Seller Payout Endpoints**

#### 1. Get Payout Summary
```http
GET /api/payouts/summary
Authorization: Bearer <seller_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "seller": {
      "id": "seller_id",
      "businessName": "My Store",
      "rating": 4.8,
      "totalSales": 150000
    },
    "balance": {
      "totalRevenue": 150000,
      "totalCommission": 15000,
      "availableBalance": 135000,
      "totalPaidOut": 100000,
      "pendingBalance": 35000
    },
    "recentPayouts": [...]
  }
}
```

#### 2. Initiate Bank Transfer Payout
```http
POST /api/payouts/bank-transfer
Authorization: Bearer <seller_token>
Content-Type: application/json

{
  "accountBank": "044",
  "accountNumber": "1234567890",
  "amount": 25000,
  "currency": "RWF",
  "beneficiaryName": "John Doe",
  "narration": "Monthly payout"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bank transfer initiated successfully",
  "data": {
    "payoutId": "payout_id",
    "transferId": 12345,
    "amount": 25000,
    "currency": "RWF",
    "beneficiaryName": "John Doe",
    "status": "PROCESSING",
    "reference": "PAYOUT_1234567890_abc123"
  }
}
```

#### 3. Initiate Mobile Money Payout
```http
POST /api/payouts/mobile-money
Authorization: Bearer <seller_token>
Content-Type: application/json

{
  "mobileNetwork": "MTN",
  "mobileNumber": "250781234567",
  "amount": 15000,
  "currency": "RWF",
  "beneficiaryName": "Jane Doe",
  "narration": "Weekly payout"
}
```

#### 4. Get Supported Banks
```http
GET /api/payouts/banks/RW
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bnk_123",
      "code": "BNR001",
      "name": "Bank of Kigali"
    },
    ...
  ]
}
```

#### 5. Get Mobile Money Networks
```http
GET /api/payouts/mobile-money-networks/RW
```

**Response:**
```json
{
  "success": true,
  "data": {
    "RW": ["MTN", "AIRTEL"]
  }
}
```

#### 6. Verify Bank Account
```http
POST /api/payouts/verify-account
Authorization: Bearer <seller_token>
Content-Type: application/json

{
  "accountNumber": "1234567890",
  "accountBank": "044"
}
```

#### 7. Get Transfer Fee Estimate
```http
POST /api/payouts/transfer-fee
Authorization: Bearer <seller_token>
Content-Type: application/json

{
  "amount": 25000,
  "currency": "RWF",
  "type": "account"
}
```

#### 8. Get Payout History
```http
GET /api/payouts/history?page=1&limit=10&status=COMPLETED
Authorization: Bearer <seller_token>
```

#### 9. Get Specific Payout Details
```http
GET /api/payouts/:id
Authorization: Bearer <seller_token>
```

#### 10. Payout Webhook
```http
POST /api/payouts/webhook
Content-Type: application/json
verif-hash: <flutterwave_signature>

{
  "event": "transfer.completed",
  "data": {
    "status": "SUCCESSFUL",
    "reference": "PAYOUT_1234567890_abc123",
    ...
  }
}
```

### Order Endpoints

#### 1. Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "couponCode": "DISCOUNT10",
  "notes": "Special delivery instructions"
}
```

#### 2. Get User Orders
```http
GET /api/orders?page=1&limit=10&status=PENDING
Authorization: Bearer <token>
```

#### 3. Get Specific Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### 4. Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <token>
```

## 🔄 Payment Flow

### 1. Customer Checkout Process
1. Customer adds items to cart
2. Customer proceeds to checkout
3. Frontend calls `POST /api/orders` to create order
4. Frontend calls `POST /api/payments/initialize` with order ID
5. Customer is redirected to Flutterwave checkout page
6. Customer completes payment
7. Flutterwave redirects back to your site
8. Frontend calls `GET /api/payments/verify/:transactionId` to confirm payment

### 2. Webhook Processing
1. Flutterwave sends webhook to `POST /api/payments/webhook`
2. System verifies webhook signature
3. Order status is updated based on payment result
4. Customer receives notification

## 💸 **NEW: Seller Payout Flow**

### 1. Payout Calculation
- System calculates seller earnings from completed orders
- Deducts platform commission (configurable per seller)
- Tracks previous payouts to determine available balance

### 2. Payout Methods Supported

#### Bank Transfers
- **Countries**: Nigeria, Kenya, Ghana, Rwanda, Uganda, Tanzania, South Africa, and more
- **Requirements**: Bank code, account number, beneficiary name
- **Processing Time**: Usually 1-3 business days

#### Mobile Money Transfers
- **Rwanda**: MTN, Airtel
- **Kenya**: M-Pesa
- **Uganda**: MTN, Airtel  
- **Tanzania**: Airtel, Halopesa, Tigo, Vodacom
- **Ghana**: AirtelTigo, MTN, Vodafone
- **Requirements**: Network code, mobile number, beneficiary name

### 3. Payout Process
1. Seller checks available balance via `GET /api/payouts/summary`
2. Seller selects payout method and enters details
3. System validates balance and account details
4. System initiates transfer with Flutterwave
5. Seller receives real-time status updates via webhooks
6. System sends notifications when payout completes/fails

## 🧪 Testing

### Run Integration Tests
```bash
./test-flutterwave-integration.sh
```

### Test Cards (Flutterwave Test Environment)
- **Successful Payment:** 4187427415564246
- **Insufficient Funds:** 4000000000000002
- **Invalid Card:** 4000000000000069

### Test Payout Flow
1. Create a seller account and get approved
2. Generate some completed orders to build available balance
3. Test bank transfer payout with test bank details
4. Test mobile money payout with test mobile numbers
5. Verify webhook notifications are received

### Test Payment Flow
1. Start the server: `cd backend && npm run dev`
2. Create a test user and get authentication token
3. Create a test order
4. Initialize payment with the order ID
5. Use test card details on Flutterwave checkout
6. Verify payment completion

## 🔧 Configuration

### Webhook URLs Setup
Configure these webhook URLs in your Flutterwave dashboard:
- **Payments**: `https://yourdomain.com/api/payments/webhook`
- **Payouts**: `https://yourdomain.com/api/payouts/webhook`

### Environment Variables
Ensure all required environment variables are set:
- `FLUTTERWAVE_PUBLIC_KEY` - Your Flutterwave public key
- `FLUTTERWAVE_SECRET_KEY` - Your Flutterwave secret key
- `FLUTTERWAVE_ENCRYPTION_KEY` - Your Flutterwave encryption key
- `FRONTEND_URL` - Your frontend URL for redirects
- `BACKEND_URL` - Your backend URL for webhooks

## 🌍 **Supported Countries for Payouts**

| Country | Bank Transfers | Mobile Money | Networks |
|---------|---------------|--------------|----------|
| Rwanda | ✅ | ✅ | MTN, Airtel |
| Nigeria | ✅ | ❌ | - |
| Kenya | ✅ | ✅ | M-Pesa |
| Uganda | ✅ | ✅ | MTN, Airtel |
| Tanzania | ✅ | ✅ | Airtel, Halopesa, Tigo, Vodacom |
| Ghana | ✅ | ✅ | AirtelTigo, MTN, Vodafone |
| South Africa | ✅ | ❌ | - |
| Cameroon | ✅ | ✅ | MTN, Orange Money |
| Côte d'Ivoire | ✅ | ✅ | Moov, MTN, Orange, Wave |
| Senegal | ✅ | ✅ | Orange Money, Wave |
| Ethiopia | ✅ | ✅ | Amole Money |

## 💰 **Payout Fees**

Flutterwave charges fees for transfers which vary by:
- **Country**: Different rates per destination
- **Amount**: Usually a percentage + fixed fee
- **Method**: Bank vs Mobile Money rates
- **Currency**: Local vs cross-border rates

Use the `/api/payouts/transfer-fee` endpoint to get real-time fee calculations.

## 🛡️ Security Features

### ✅ Implemented Security Measures
- Webhook signature verification for both payments and payouts
- JWT authentication for API endpoints
- Input validation and sanitization
- Error handling and logging
- Admin-only refund processing
- Seller balance verification before payouts
- Unique transfer references to prevent duplicates

### 🔒 Best Practices
- Never expose secret keys in frontend code
- Always verify payments and transfers on the backend
- Use HTTPS for all payment-related endpoints
- Implement proper error handling
- Log all payment and payout transactions for audit
- Validate seller balances before allowing payouts
- Monitor for suspicious payout patterns

## 📊 Payment & Payout Status Flow

### Payment Status
```
PENDING → PROCESSING → COMPLETED
    ↓         ↓           ↓
CANCELLED   FAILED    REFUNDED
```

### Payout Status
```
PENDING → PROCESSING → COMPLETED
    ↓         ↓           ↓
CANCELLED   FAILED
```

## 🚨 Error Handling

The integration includes comprehensive error handling for:
- **Payments**: Invalid payment references, network timeouts, webhook signature validation failures
- **Payouts**: Insufficient seller balance, invalid account details, transfer failures
- **Orders**: Insufficient product stock, invalid coupon codes
- **Authentication**: Token validation failures, unauthorized access

## 📈 Monitoring

### Key Metrics to Monitor
- Payment success rate
- Average payment processing time
- Failed payment reasons
- Payout success rate
- Seller payout volume and frequency
- Webhook delivery success
- Platform commission revenue

### Logging
All payment and payout operations are logged with appropriate levels:
- `INFO` - Successful operations
- `WARN` - Retryable failures
- `ERROR` - Critical failures requiring attention

## 🔄 Next Steps

1. **Test the Integration**: Run the test script and verify all endpoints
2. **Configure Webhooks**: Set up webhook URLs in Flutterwave dashboard
3. **Test Payouts**: Create test sellers and verify payout functionality
4. **Frontend Integration**: Implement payment and payout UI components
5. **Go Live**: Switch to production credentials when ready
6. **Monitor**: Set up monitoring and alerting for payment/payout operations

## 📞 Support

For Flutterwave-specific issues:
- Documentation: https://developer.flutterwave.com/
- Support: support@flutterwave.com

For integration issues:
- Check server logs for detailed error messages
- Verify environment variables are correctly set
- Ensure webhook URLs are accessible from Flutterwave servers
- Verify seller balances and account details for payouts

## 🎯 **Key Benefits of This Implementation**

✅ **Complete Marketplace Solution**: Handle both customer payments and seller payouts  
✅ **Multi-Currency Support**: Process payments and payouts in different currencies  
✅ **Multiple Payout Methods**: Bank transfers and mobile money across Africa  
✅ **Real-time Processing**: Webhooks for instant status updates  
✅ **Comprehensive Tracking**: Full audit trail for all transactions  
✅ **Flexible Commission**: Configurable commission rates per seller  
✅ **Secure**: Industry-standard security practices implemented  
✅ **Scalable**: Built to handle high transaction volumes 