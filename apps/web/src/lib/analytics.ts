// Analytics utility for tracking user interactions and events
// Integrated with PostHog for comprehensive analytics
import { posthog, trackEvent as posthogTrackEvent, identifyUser, resetUser } from './posthog';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

interface PageViewEvent {
  page: string;
  title: string;
  url: string;
  referrer?: string;
}

interface EcommerceEvent {
  event: 'product_viewed' | 'product_added_to_cart' | 'product_removed_from_cart' | 'checkout_started' | 'purchase_completed';
  product_id?: string;
  product_name?: string;
  category?: string;
  price?: number;
  currency?: string;
  quantity?: number;
  order_id?: string;
  value?: number;
}

class Analytics {
  private isEnabled: boolean;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    // Try to get user ID from localStorage or session storage
    const storedUserId = localStorage.getItem('analytics_user_id');
    if (storedUserId) return storedUserId;

    // Generate new user ID
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_user_id', newUserId);
    return newUserId;
  }

  // Track page views
  trackPageView(data: PageViewEvent): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      event: 'page_viewed',
      properties: {
        page: data.page,
        title: data.title,
        url: data.url,
        referrer: data.referrer,
        timestamp: new Date().toISOString()
      },
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  // Track ecommerce events
  trackEcommerce(data: EcommerceEvent): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      event: data.event,
      properties: {
        ...data,
        timestamp: new Date().toISOString()
      },
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  // Track custom events
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString()
      },
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.sendEvent(event);
  }

  // Track user interactions
  trackInteraction(action: string, element: string, properties?: Record<string, any>): void {
    this.trackEvent('user_interaction', {
      action,
      element,
      ...properties
    });
  }

  // Track form submissions
  trackFormSubmission(formName: string, success: boolean, properties?: Record<string, any>): void {
    this.trackEvent('form_submitted', {
      form_name: formName,
      success,
      ...properties
    });
  }

  // Track search queries
  trackSearch(query: string, resultsCount: number, properties?: Record<string, any>): void {
    this.trackEvent('search_performed', {
      query,
      results_count: resultsCount,
      ...properties
    });
  }

  // Track CTA clicks
  trackCTAClick(ctaType: 'primary' | 'secondary', location: string, properties?: Record<string, any>): void {
    this.trackEvent('cta_clicked', {
      cta_type: ctaType,
      location,
      ...properties
    });
  }

  // Track product interactions
  trackProductInteraction(action: 'viewed' | 'added_to_cart' | 'added_to_wishlist' | 'removed_from_cart', productId: string, properties?: Record<string, any>): void {
    this.trackEvent('product_interaction', {
      action,
      product_id: productId,
      ...properties
    });
  }

  // Track carousel interactions
  trackCarouselInteraction(action: 'slide_changed' | 'autoplay_paused' | 'autoplay_resumed', carouselName: string, slideIndex?: number): void {
    this.trackEvent('carousel_interaction', {
      action,
      carousel_name: carouselName,
      slide_index: slideIndex
    });
  }

  // Track newsletter subscriptions
  trackNewsletterSubscription(email: string, source: string): void {
    this.trackEvent('newsletter_subscribed', {
      email: email.substring(0, 3) + '***', // Partial email for privacy
      source
    });
  }

  // Track contact form submissions
  trackContactFormSubmission(category: string, success: boolean, ticketId?: string): void {
    this.trackEvent('contact_form_submitted', {
      category,
      success,
      ticket_id: ticketId
    });
  }

  // Track FAQ interactions
  trackFAQInteraction(action: 'question_opened' | 'question_closed' | 'search_performed', questionId?: string, searchQuery?: string): void {
    this.trackEvent('faq_interaction', {
      action,
      question_id: questionId,
      search_query: searchQuery
    });
  }

  // Track policy page views
  trackPolicyPageView(policyType: 'privacy' | 'terms' | 'refunds' | 'gst-faq'): void {
    this.trackEvent('policy_page_viewed', {
      policy_type: policyType
    });
  }

  // Send event to analytics service
  private sendEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined') return;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }

    // Send to PostHog
    if (posthog) {
      posthogTrackEvent(event.event, event.properties);
    }

    // Send to your custom analytics endpoint as backup
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch(error => {
      console.error('Failed to send analytics event:', error);
    });
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.trackEvent('user_properties_set', properties);
  }

  // Identify user
  identify(userId: string, properties?: Record<string, any>): void {
    this.userId = userId;
    if (properties) {
      this.setUserProperties(properties);
    }
    
    // Identify user in PostHog
    if (posthog) {
      identifyUser(userId, properties);
    }
  }

  // Reset session
  resetSession(): void {
    this.sessionId = this.generateSessionId();
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;

// Export individual tracking functions for convenience
export const {
  trackPageView,
  trackEcommerce,
  trackEvent,
  trackInteraction,
  trackFormSubmission,
  trackSearch,
  trackCTAClick,
  trackProductInteraction,
  trackCarouselInteraction,
  trackNewsletterSubscription,
  trackContactFormSubmission,
  trackFAQInteraction,
  trackPolicyPageView,
  setUserProperties,
  identify,
  resetSession
} = analytics;

