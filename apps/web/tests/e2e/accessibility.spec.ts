import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['keyboard'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/contact');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['form'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['heading-order'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper image alt text', async ({ page }) => {
    await page.goto('/products');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['image-alt'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['link-name'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['button-name'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['aria'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be screen reader friendly', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['screen-reader'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Test accessibility with focus
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['focus-order-semantics'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should handle dynamic content accessibility', async ({ page }) => {
    await page.goto('/products');
    
    // Add product to cart to trigger dynamic content
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    
    // Check accessibility after dynamic content change
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper error message accessibility', async ({ page }) => {
    await page.goto('/contact');
    
    // Submit form without required fields to trigger error
    await page.click('[data-testid="submit-button"]');
    
    // Check accessibility of error messages
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['error-message'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper loading state accessibility', async ({ page }) => {
    await page.goto('/products');
    
    // Check accessibility during loading
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['loading'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper modal accessibility', async ({ page }) => {
    await page.goto('/products');
    
    // Open product modal
    await page.click('[data-testid="product-card"]:first-child [data-testid="quick-view"]');
    
    // Check modal accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['modal'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper table accessibility', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Check table accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['table'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

