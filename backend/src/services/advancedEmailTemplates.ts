interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  discount?: number;
}

class AdvancedEmailTemplates {
  
  /**
   * Personalized Product Recommendations (like Amazon)
   */
  personalizedRecommendations(userData: any, recommendations: ProductRecommendation[]): EmailTemplate {
    const discountBadge = (discount: number) => discount > 0 ? 
      `<div style="position: absolute; top: 10px; right: 10px; background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">-${discount}%</div>` : '';

    const priceDisplay = (product: ProductRecommendation) => {
      if (product.originalPrice && product.originalPrice > product.price) {
        return `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #dc2626; font-weight: bold; font-size: 16px;">${product.price.toLocaleString()} RWF</span>
            <span style="color: #9ca3af; text-decoration: line-through; font-size: 14px;">${product.originalPrice.toLocaleString()} RWF</span>
          </div>
        `;
      }
      return `<span style="color: #1f2937; font-weight: bold; font-size: 16px;">${product.price.toLocaleString()} RWF</span>`;
    };

    const starRating = (rating: number) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      let stars = '★'.repeat(fullStars);
      if (hasHalfStar) stars += '☆';
      stars += '☆'.repeat(5 - Math.ceil(rating));
      return `<span style="color: #fbbf24; font-size: 14px;">${stars}</span>`;
    };

    return {
      subject: `${userData.name}, we found items you might love! 💝`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Iwanyu Store</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Personalized just for you</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Hi ${userData.name}! 👋</h2>
            <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">Based on your browsing history and preferences, we've curated these special items just for you:</p>

            <!-- Product Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 30px 0;">
              ${recommendations.map(product => `
                <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; position: relative; transition: transform 0.2s;">
                  ${discountBadge(product.discount || 0)}
                  <div style="position: relative; height: 200px; background: #f9fafb; display: flex; align-items: center; justify-content: center;">
                    <img src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                  </div>
                  <div style="padding: 15px;">
                    <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; line-height: 1.4; height: 44px; overflow: hidden;">${product.name}</h3>
                    <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
                      ${starRating(product.rating)}
                      <span style="color: #6b7280; font-size: 14px;">(${product.reviewCount})</span>
                    </div>
                    ${priceDisplay(product)}
                    <div style="margin-top: 15px;">
                      <a href="${process.env.FRONTEND_URL}/products/${product.id}" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600; width: 100%; text-align: center; box-sizing: border-box;">View Details</a>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Special Offer -->
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 2px solid #f59e0b;">
              <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">🎯 Limited Time Offer!</h3>
              <p style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">Use code <strong>PERSONAL10</strong> for 10% off any recommended items</p>
              <p style="color: #b45309; margin: 0; font-size: 14px;">Valid for 48 hours only • Minimum order 15,000 RWF</p>
            </div>

            <!-- Browse More -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/products" style="background: #1f2937; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600;">Browse All Products</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Why shop with Iwanyu Store?</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: left;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #10b981; font-size: 18px;">🚚</span>
                  <span style="color: #4b5563; font-size: 14px;">Free shipping over 20K</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #10b981; font-size: 18px;">↩️</span>
                  <span style="color: #4b5563; font-size: 14px;">30-day returns</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #10b981; font-size: 18px;">🔒</span>
                  <span style="color: #4b5563; font-size: 14px;">Secure payments</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #10b981; font-size: 18px;">📞</span>
                  <span style="color: #4b5563; font-size: 14px;">24/7 support</span>
                </div>
              </div>
            </div>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              You're receiving this because you're a valued Iwanyu Store customer. 
              <a href="#" style="color: #f97316;">Unsubscribe</a> | 
              <a href="#" style="color: #f97316;">Update preferences</a>
            </p>
          </div>
        </div>
      `,
      textContent: `Hi ${userData.name}! We've found some items you might love. Use code PERSONAL10 for 10% off. Visit ${process.env.FRONTEND_URL}/products`
    };
  }

  /**
   * Price Drop Alert (like Amazon)
   */
  priceDropAlert(productData: any, userData: any): EmailTemplate {
    const savings = productData.originalPrice - productData.newPrice;
    const discountPercent = Math.round((savings / productData.originalPrice) * 100);

    return {
      subject: `🔥 Price Drop Alert! ${productData.name} is now ${discountPercent}% OFF`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🔥 PRICE DROP ALERT!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">The item you wanted is now cheaper!</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Hi ${userData.name}! 👋</h2>
            <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">Great news! The item you've been watching has dropped in price. Don't miss out on this amazing deal!</p>

            <!-- Product Card -->
            <div style="border: 2px solid #dc2626; border-radius: 12px; overflow: hidden; margin: 30px 0; position: relative;">
              <div style="position: absolute; top: 15px; right: 15px; background: #dc2626; color: white; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px; z-index: 10;">
                -${discountPercent}% OFF
              </div>
              
              <div style="display: flex; flex-direction: row; align-items: center; padding: 20px; gap: 20px;">
                <div style="flex-shrink: 0; width: 150px; height: 150px; background: #f9fafb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <img src="${productData.image}" alt="${productData.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                
                <div style="flex: 1;">
                  <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px; font-weight: 600; line-height: 1.4;">${productData.name}</h3>
                  
                  <div style="margin: 15px 0;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                      <span style="color: #dc2626; font-weight: bold; font-size: 24px;">${productData.newPrice.toLocaleString()} RWF</span>
                      <span style="color: #9ca3af; text-decoration: line-through; font-size: 18px;">${productData.originalPrice.toLocaleString()} RWF</span>
                    </div>
                    <p style="color: #059669; margin: 0; font-weight: 600; font-size: 16px;">You save ${savings.toLocaleString()} RWF!</p>
                  </div>

                  <div style="margin-top: 20px;">
                    <a href="${process.env.FRONTEND_URL}/products/${productData.id}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: 600;">Buy Now</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Urgency Message -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">⏰ Limited Time Offer</h4>
              <p style="color: #92400e; margin: 0; font-size: 14px;">This price drop won't last long. Stock is limited and demand is high. Order now to secure this deal!</p>
            </div>

            <!-- Similar Products -->
            <div style="margin: 30px 0;">
              <h4 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">You might also like:</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
                <div style="text-align: center; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <div style="width: 80px; height: 80px; background: #f9fafb; border-radius: 6px; margin: 0 auto 10px auto;"></div>
                  <p style="color: #4b5563; margin: 0; font-size: 12px;">Similar Item 1</p>
                  <p style="color: #f97316; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">25,000 RWF</p>
                </div>
                <div style="text-align: center; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <div style="width: 80px; height: 80px; background: #f9fafb; border-radius: 6px; margin: 0 auto 10px auto;"></div>
                  <p style="color: #4b5563; margin: 0; font-size: 12px;">Similar Item 2</p>
                  <p style="color: #f97316; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">30,000 RWF</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
              You're receiving this because you added this item to your wishlist.
            </p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              <a href="#" style="color: #f97316;">Manage price alerts</a> | 
              <a href="#" style="color: #f97316;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
      textContent: `Price Drop Alert! ${productData.name} is now ${discountPercent}% OFF. Was ${productData.originalPrice.toLocaleString()} RWF, now ${productData.newPrice.toLocaleString()} RWF. You save ${savings.toLocaleString()} RWF! Buy now: ${process.env.FRONTEND_URL}/products/${productData.id}`
    };
  }

  /**
   * Back in Stock Alert
   */
  backInStockAlert(productData: any, userData: any): EmailTemplate {
    return {
      subject: `🎉 Good News! ${productData.name} is back in stock`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🎉 BACK IN STOCK!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">The item you wanted is available again</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Hi ${userData.name}! 👋</h2>
            <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">Exciting news! The item you've been waiting for is back in stock. Don't wait too long - popular items sell out fast!</p>

            <!-- Product Card -->
            <div style="border: 2px solid #10b981; border-radius: 12px; overflow: hidden; margin: 30px 0;">
              <div style="display: flex; flex-direction: row; align-items: center; padding: 20px; gap: 20px;">
                <div style="flex-shrink: 0; width: 150px; height: 150px; background: #f9fafb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <img src="${productData.image}" alt="${productData.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                
                <div style="flex: 1;">
                  <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px; font-weight: 600; line-height: 1.4;">${productData.name}</h3>
                  
                  <div style="margin: 15px 0;">
                    <span style="color: #1f2937; font-weight: bold; font-size: 20px;">${productData.price.toLocaleString()} RWF</span>
                  </div>

                  <div style="background: #f0fdf4; padding: 10px; border-radius: 6px; margin: 15px 0;">
                    <p style="color: #059669; margin: 0; font-weight: 600; font-size: 14px;">✅ In Stock - ${productData.stockCount || 'Limited'} available</p>
                  </div>

                  <div style="margin-top: 20px;">
                    <a href="${process.env.FRONTEND_URL}/products/${productData.id}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: 600;">Order Now</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Urgency Message -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">⚡ Act Fast!</h4>
              <p style="color: #92400e; margin: 0; font-size: 14px;">This item was out of stock for a reason - it's popular! Order now before it sells out again.</p>
            </div>

            <!-- Add to Cart CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/products/${productData.id}" style="background: #f97316; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Add to Cart Now</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
              You're receiving this because you requested to be notified when this item is back in stock.
            </p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              <a href="#" style="color: #f97316;">Manage stock alerts</a> | 
              <a href="#" style="color: #f97316;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
      textContent: `Good news! ${productData.name} is back in stock for ${productData.price.toLocaleString()} RWF. Order now before it sells out again: ${process.env.FRONTEND_URL}/products/${productData.id}`
    };
  }

  /**
   * Win-back Campaign (like Amazon)
   */
  winBackCampaign(userData: any, daysInactive: number): EmailTemplate {
    return {
      subject: `We miss you, ${userData.name}! Come back for exclusive deals 💝`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #a855f7); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">We Miss You! 💜</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">Come back and discover what's new</p>
          </div>

          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">Hi ${userData.name}! 👋</h2>
            <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; text-align: center;">It's been ${daysInactive} days since your last visit. We've added amazing new products and exclusive deals just for you!</p>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; border: 3px solid #f59e0b;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">🎁 Welcome Back Gift!</h3>
              <div style="background: white; color: #92400e; padding: 15px 25px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 24px; margin: 15px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                20% OFF
              </div>
              <p style="color: #92400e; margin: 10px 0; font-size: 16px;">Your next purchase</p>
              <p style="color: #b45309; margin: 0; font-size: 14px;">Use code: <strong>WELCOME20</strong> • Valid for 7 days</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/products" style="background: #8b5cf6; color: white; padding: 18px 40px; text-decoration: none; border-radius: 10px; display: inline-block; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Start Shopping Again</a>
            </div>
          </div>
        </div>
      `,
      textContent: `Hi ${userData.name}! We miss you at Iwanyu Store. It's been ${daysInactive} days since your last visit. Come back and get 20% OFF your next purchase with code WELCOME20. Visit ${process.env.FRONTEND_URL}/products`
    };
  }
}

export default new AdvancedEmailTemplates(); 