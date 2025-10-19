import { test, expect } from '@playwright/test';

test.describe('Phase 7: E-Commerce Core - Discovery to Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the products page
    await page.goto('/products');
  });

  test('7.1 Product Listing - Grid/List Toggle and Filters', async ({ page }) => {
    // Test grid/list toggle
    await expect(page.locator('[data-testid="grid-view-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="list-view-button"]')).toBeVisible();

    // Test list view
    await page.click('[data-testid="list-view-button"]');
    await expect(page.locator('.product-card-list')).toBeVisible();

    // Test grid view
    await page.click('[data-testid="grid-view-button"]');
    await expect(page.locator('.product-card-grid')).toBeVisible();

    // Test filters
    await page.click('[data-testid="filters-button"]');
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="price-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="organic-filter"]')).toBeVisible();

    // Test category filter
    await page.selectOption('[data-testid="category-filter"]', 'whole-spices');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

    // Test organic filter
    await page.check('[data-testid="organic-filter"]');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

    // Test clear filters
    await page.click('[data-testid="clear-filters"]');
    await expect(page.locator('[data-testid="organic-filter"]')).not.toBeChecked();
  });

  test('7.1 Product Listing - Search and Sorting', async ({ page }) => {
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'turmeric');
    await page.press('[data-testid="search-input"]', 'Enter');
    await expect(page.locator('h1')).toContainText('Search Results for "turmeric"');

    // Test search suggestions
    await page.fill('[data-testid="search-input"]', 'card');
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();

    // Test sorting
    await page.selectOption('[data-testid="sort-select"]', 'price-asc');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();

    await page.selectOption('[data-testid="sort-select"]', 'price-desc');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('7.2 Product Detail Page - Media Gallery and Variants', async ({ page }) => {
    // Navigate to a product detail page
    await page.click('[data-testid="product-card"]:first-child a');
    await expect(page.locator('[data-testid="product-detail-page"]')).toBeVisible();

    // Test image gallery
    await expect(page.locator('[data-testid="main-product-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="thumbnail-images"]')).toBeVisible();

    // Test thumbnail navigation
    await page.click('[data-testid="thumbnail-1"]');
    await expect(page.locator('[data-testid="main-product-image"]')).toBeVisible();

    // Test zoom functionality
    await page.click('[data-testid="zoom-button"]');
    await expect(page.locator('[data-testid="image-modal"]')).toBeVisible();
    await page.click('[data-testid="close-modal"]');

    // Test variant selection
    if (await page.locator('[data-testid="variant-selector"]').isVisible()) {
      await page.click('[data-testid="variant-option-1"]');
      await expect(page.locator('[data-testid="selected-variant"]')).toBeVisible();
    }

    // Test quantity selector
    await page.click('[data-testid="quantity-increase"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('2');

    // Test shipping estimator
    await page.fill('[data-testid="pincode-input"]', '400001');
    await page.click('[data-testid="check-shipping"]');
    await expect(page.locator('[data-testid="shipping-estimate"]')).toBeVisible();
  });

  test('7.2 Product Detail Page - Add to Cart and Wishlist', async ({ page }) => {
    // Navigate to a product detail page
    await page.click('[data-testid="product-card"]:first-child a');

    // Test add to cart
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="cart-success-message"]')).toBeVisible();

    // Test add to wishlist
    await page.click('[data-testid="add-to-wishlist-button"]');
    await expect(page.locator('[data-testid="wishlist-success-message"]')).toBeVisible();

    // Test gift message modal
    await page.click('[data-testid="gift-message-button"]');
    await expect(page.locator('[data-testid="gift-modal"]')).toBeVisible();
    await page.fill('[data-testid="gift-message-textarea"]', 'Happy Birthday!');
    await page.click('[data-testid="save-gift-message"]');
    await expect(page.locator('[data-testid="gift-modal"]')).not.toBeVisible();
  });

  test('7.3 Cart Page - Line Items and Totals', async ({ page }) => {
    // Add items to cart first
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    await page.goto('/cart');

    // Test cart page elements
    await expect(page.locator('[data-testid="cart-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();

    // Test quantity update
    await page.click('[data-testid="quantity-increase"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('2');

    // Test remove item
    await page.click('[data-testid="remove-item"]');
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
  });

  test('7.3 Cart Page - Promo Codes', async ({ page }) => {
    // Add items to cart first
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    await page.goto('/cart');

    // Test valid promo code
    await page.fill('[data-testid="promo-code-input"]', 'WELCOME10');
    await page.click('[data-testid="apply-promo"]');
    await expect(page.locator('[data-testid="promo-success"]')).toBeVisible();

    // Test invalid promo code
    await page.fill('[data-testid="promo-code-input"]', 'INVALID');
    await page.click('[data-testid="apply-promo"]');
    await expect(page.locator('[data-testid="promo-error"]')).toBeVisible();

    // Test remove promo code
    await page.click('[data-testid="remove-promo"]');
    await expect(page.locator('[data-testid="promo-code-input"]')).toBeVisible();
  });

  test('7.4 Checkout Page - Address and Payment', async ({ page }) => {
    // Add items to cart and proceed to checkout
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    await page.goto('/cart');
    await page.click('[data-testid="proceed-to-checkout"]');

    // Test checkout page elements
    await expect(page.locator('[data-testid="checkout-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-steps"]')).toBeVisible();

    // Test address form
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="address1"]', '123 Main St');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.fill('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="postal-code"]', '400001');
    await page.fill('[data-testid="phone"]', '9876543210');

    // Test same billing address checkbox
    await page.check('[data-testid="same-billing-address"]');

    // Proceed to next step
    await page.click('[data-testid="next-step"]');

    // Test shipping method selection
    await expect(page.locator('[data-testid="shipping-methods"]')).toBeVisible();
    await page.click('[data-testid="shipping-method-1"]');
    await page.click('[data-testid="next-step"]');

    // Test payment method selection
    await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible();
    await page.click('[data-testid="payment-method-card"]');

    // Test place order (mock)
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="order-processing"]')).toBeVisible();
  });

  test('7.5 Order Confirmation - Success Page', async ({ page }) => {
    // Mock successful order
    await page.goto('/checkout/success?orderId=TEST-ORDER-123');

    // Test success page elements
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toContainText('TEST-ORDER-123');
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();

    // Test order details
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-info"]')).toBeVisible();

    // Test actions
    await page.click('[data-testid="download-invoice"]');
    await page.click('[data-testid="share-order"]');
    await page.click('[data-testid="view-all-orders"]');
  });

  test('7.6 Order Failure - Retry Page', async ({ page }) => {
    // Mock failed order
    await page.goto('/checkout/failure?error=payment_failed&orderId=TEST-ORDER-123');

    // Test failure page elements
    await expect(page.locator('[data-testid="order-failure"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Test retry functionality
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="retry-processing"]')).toBeVisible();

    // Test support contact
    await page.click('[data-testid="contact-support"]');
    await expect(page.locator('[data-testid="support-modal"]')).toBeVisible();
  });

  test('7.7 Search Results - Autocomplete and Filters', async ({ page }) => {
    // Navigate to search page
    await page.goto('/search');

    // Test search input
    await page.fill('[data-testid="search-input"]', 'turmeric');
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();

    // Test suggestion selection
    await page.click('[data-testid="suggestion-0"]');
    await expect(page.locator('h1')).toContainText('Search Results for "turmeric"');

    // Test search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible();

    // Test "Did you mean" suggestions
    if (await page.locator('[data-testid="did-you-mean"]').isVisible()) {
      await page.click('[data-testid="did-you-mean-suggestion"]');
    }

    // Test search filters
    await page.click('[data-testid="filters-button"]');
    await page.selectOption('[data-testid="category-filter"]', 'ground-spices');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('Accessibility - Keyboard Navigation', async ({ page }) => {
    // Test keyboard navigation on product listing
    await page.goto('/products');
    await page.press('body', 'Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test keyboard navigation on product detail
    await page.click('[data-testid="product-card"]:first-child a');
    await page.press('body', 'Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test keyboard navigation on cart
    await page.goto('/cart');
    await page.press('body', 'Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test product listing on mobile
    await page.goto('/products');
    await expect(page.locator('[data-testid="mobile-filters"]')).toBeVisible();

    // Test product detail on mobile
    await page.click('[data-testid="product-card"]:first-child a');
    await expect(page.locator('[data-testid="mobile-product-detail"]')).toBeVisible();

    // Test cart on mobile
    await page.goto('/cart');
    await expect(page.locator('[data-testid="mobile-cart"]')).toBeVisible();
  });

  test('Analytics Tracking', async ({ page }) => {
    // Mock analytics tracking
    await page.addInitScript(() => {
      window.gtag = (command: string, action: string, parameters: any) => {
        console.log('Analytics:', { command, action, parameters });
      };
    });

    // Test product impression tracking
    await page.goto('/products');
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible();

    // Test add to cart tracking
    await page.click('[data-testid="add-to-cart"]');
    // Check console for analytics events

    // Test checkout tracking
    await page.goto('/checkout');
    // Check console for analytics events
  });
});
