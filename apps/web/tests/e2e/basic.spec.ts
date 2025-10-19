import { test, expect } from '@playwright/test';

test.describe('Newhill Spices E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Newhill Spices/);
    await expect(page.locator('h1')).toContainText('Premium Spices');
  });

  test('should navigate to products page', async ({ page }) => {
    await page.click('text=Products');
    await expect(page).toHaveURL(/.*products/);
    await expect(page.locator('h1')).toContainText('Our Spices');
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click add to cart on first product
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    
    // Check cart count
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });

  test('should complete checkout flow', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.waitForSelector('[data-testid="product-card"]');
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    
    // Go to cart
    await page.click('[data-testid="cart-button"]');
    await expect(page).toHaveURL(/.*cart/);
    
    // Proceed to checkout
    await page.click('text=Proceed to Checkout');
    await expect(page).toHaveURL(/.*checkout/);
    
    // Fill checkout form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="phone"]', '+1234567890');
    await page.fill('[data-testid="address"]', '123 Test Street');
    await page.fill('[data-testid="city"]', 'Test City');
    await page.fill('[data-testid="postalCode"]', '12345');
    
    // Select shipping method
    await page.click('[data-testid="shipping-standard"]');
    
    // Proceed to payment
    await page.click('text=Continue to Payment');
    
    // Mock payment completion
    await page.click('[data-testid="mock-payment-success"]');
    
    // Verify success page
    await expect(page).toHaveURL(/.*checkout\/success/);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });

  test('should handle user authentication', async ({ page }) => {
    // Test login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Verify login success
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/products');
    
    // Search for a product
    await page.fill('[data-testid="search-input"]', 'cardamom');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="product-card"]')).toContainText('cardamom');
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    
    // Click on a category filter
    await page.click('[data-testid="category-filter"]:has-text("Spices")');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount({ min: 1 });
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile navigation
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Verify tablet layout
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // Verify desktop layout
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
  });

  test('should handle accessibility requirements', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper form labels
    await page.goto('/contact');
    const formLabels = page.locator('label');
    await expect(formLabels).toHaveCount({ min: 1 });
    
    // Check for proper button text
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const text = await buttons.nth(i).textContent();
      const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should handle error states', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    await expect(page.locator('h1')).toContainText('404');
    
    // Test network error handling
    await page.route('**/api/products', route => route.abort());
    await page.goto('/products');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should handle multi-language support', async ({ page }) => {
    await page.goto('/');
    
    // Test language switcher
    await page.click('[data-testid="language-switcher"]');
    await page.click('text=العربية');
    
    // Verify Arabic content
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    
    // Switch back to English
    await page.click('[data-testid="language-switcher"]');
    await page.click('text=English');
    
    // Verify English content
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('should handle multi-currency support', async ({ page }) => {
    await page.goto('/products');
    
    // Test currency switcher
    await page.click('[data-testid="currency-switcher"]');
    await page.click('text=AED');
    
    // Verify currency change
    await expect(page.locator('[data-testid="price"]')).toContainText('د.إ');
    
    // Switch back to INR
    await page.click('[data-testid="currency-switcher"]');
    await page.click('text=INR');
    
    // Verify INR currency
    await expect(page.locator('[data-testid="price"]')).toContainText('₹');
  });
});

