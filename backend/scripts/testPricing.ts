import { calculateProductPrice, calculateOrderTotal } from '../src/utils/priceUtils';

// Test pricing scenarios
const testScenarios = [
  {
    name: "Basic product pricing",
    product: { price: 1000 },
    options: { quantity: 2 },
    expected: 2000
  },
  {
    name: "Product with sale price",
    product: { price: 1000, salePrice: 800 },
    options: { quantity: 1 },
    expected: 800
  },
  {
    name: "Product with variant pricing",
    product: { 
      price: 1000, 
      variants: [{ id: 'variant-1', price: 1200 }] 
    },
    options: { variantId: 'variant-1', quantity: 1 },
    expected: 1200
  },
  {
    name: "Product with variant and sale price (sale price wins)",
    product: { 
      price: 1000, 
      salePrice: 700,
      variants: [{ id: 'variant-1', price: 1200 }] 
    },
    options: { variantId: 'variant-1', quantity: 1 },
    expected: 700
  },
  {
    name: "Product with variant lower than sale price",
    product: { 
      price: 1000, 
      salePrice: 900,
      variants: [{ id: 'variant-1', price: 800 }] 
    },
    options: { variantId: 'variant-1', quantity: 1 },
    expected: 800
  }
];

// Order total scenarios
const orderTotalScenarios = [
  {
    name: "Basic order with shipping",
    subtotal: 5000,
    options: {},
    expected: 6500 // 5000 + 1500 shipping
  },
  {
    name: "Order with discount",
    subtotal: 5000,
    options: { discount: 500 },
    expected: 6000 // 5000 - 500 + 1500
  },
  {
    name: "Order with custom shipping",
    subtotal: 5000,
    options: { shipping: 2000 },
    expected: 7000 // 5000 + 2000
  }
];

console.log('🧪 Testing Product Pricing Logic...\n');

// Test product pricing
testScenarios.forEach((scenario, index) => {
  const result = calculateProductPrice(scenario.product, scenario.options);
  const passed = result === scenario.expected;
  
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   Expected: ${scenario.expected} RWF`);
  console.log(`   Actual:   ${result} RWF`);
  console.log(`   Status:   ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('🧪 Testing Order Total Logic...\n');

// Test order totals
orderTotalScenarios.forEach((scenario, index) => {
  const result = calculateOrderTotal(scenario.subtotal, scenario.options);
  const passed = result === scenario.expected;
  
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   Expected: ${scenario.expected} RWF`);
  console.log(`   Actual:   ${result} RWF`);
  console.log(`   Status:   ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('✅ Pricing validation tests completed!'); 