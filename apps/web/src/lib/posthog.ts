import { PostHog } from 'posthog-js';

// PostHog configuration
export const posthogConfig = {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
  loaded: (posthog: PostHog) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PostHog loaded');
    }
  },
  capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  capture_pageleave: true, // Enable pageleave capture
};

// Initialize PostHog
export const initPostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    const { PostHog } = require('posthog-js');
    
    const posthog = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_KEY!,
      posthogConfig
    );
    
    return posthog;
  }
  return null;
};

// PostHog instance
export const posthog = typeof window !== 'undefined' ? initPostHog() : null;

// Helper functions for tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (posthog) {
    posthog.capture(eventName, properties);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (posthog) {
    posthog.identify(userId, properties);
  }
};

export const resetUser = () => {
  if (posthog) {
    posthog.reset();
  }
};

// E-commerce specific tracking functions
export const trackProductView = (productId: string, productName: string, price: number, currency: string = 'INR') => {
  trackEvent('product_viewed', {
    product_id: productId,
    product_name: productName,
    price,
    currency,
  });
};

export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number = 1, currency: string = 'INR') => {
  trackEvent('product_added_to_cart', {
    product_id: productId,
    product_name: productName,
    price,
    quantity,
    currency,
  });
};

export const trackPurchase = (orderId: string, total: number, currency: string = 'INR', items: any[] = []) => {
  trackEvent('purchase', {
    order_id: orderId,
    total,
    currency,
    items,
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', {
    search_query: query,
    results_count: resultsCount,
  });
};

export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  trackEvent('$pageview', {
    page_name: pageName,
    ...properties,
  });
};


