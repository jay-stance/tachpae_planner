/**
 * Meta Pixel Event Tracking Utilities
 * 
 * Standard events supported:
 * - PageView (automatic)
 * - ViewContent - Product views
 * - AddToCart - Adding items to cart
 * - InitiateCheckout - Starting checkout
 * - Purchase - Completing order
 * - Lead - Proposal creation, contact forms
 * - Contact - WhatsApp clicks
 * - CompleteRegistration - Sign ups
 */

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

type MetaEventName = 
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'Contact'
  | 'CompleteRegistration'
  | 'Search'
  | 'AddToWishlist'
  | 'AddPaymentInfo';

interface MetaEventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  search_string?: string;
  status?: string;
  [key: string]: any;
}

/**
 * Track a Meta Pixel standard event
 */
export function trackMetaEvent(eventName: MetaEventName, params?: MetaEventParams): void {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (params) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
      console.log(`[Meta Pixel] Tracked: ${eventName}`, params || '');
    } catch (error) {
      console.error('[Meta Pixel] Failed to track event:', error);
    }
  }
}

/**
 * Track a custom Meta Pixel event
 */
export function trackMetaCustomEvent(eventName: string, params?: MetaEventParams): void {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (params) {
        window.fbq('trackCustom', eventName, params);
      } else {
        window.fbq('trackCustom', eventName);
      }
      console.log(`[Meta Pixel] Custom Event: ${eventName}`, params || '');
    } catch (error) {
      console.error('[Meta Pixel] Failed to track custom event:', error);
    }
  }
}

// ============================================
// Convenience functions for common events
// ============================================

/**
 * Track product view
 */
export function trackProductView(product: {
  id: string;
  name: string;
  category?: string;
  price: number;
}): void {
  trackMetaEvent('ViewContent', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'NGN',
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
}): void {
  trackMetaEvent('AddToCart', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * (product.quantity || 1),
    currency: 'NGN',
    num_items: product.quantity || 1,
  });
}

/**
 * Track checkout initiation
 */
export function trackInitiateCheckout(cartData: {
  value: number;
  itemCount: number;
  productIds: string[];
}): void {
  trackMetaEvent('InitiateCheckout', {
    content_ids: cartData.productIds,
    content_type: 'product',
    value: cartData.value,
    currency: 'NGN',
    num_items: cartData.itemCount,
  });
}

/**
 * Track purchase completion
 */
export function trackPurchase(orderData: {
  orderId: string;
  value: number;
  itemCount: number;
  productIds: string[];
}): void {
  trackMetaEvent('Purchase', {
    content_ids: orderData.productIds,
    content_type: 'product',
    value: orderData.value,
    currency: 'NGN',
    num_items: orderData.itemCount,
  });
}

/**
 * Track lead generation (proposals, contact forms)
 */
export function trackLead(leadData?: {
  content_name?: string;
  content_category?: string;
  value?: number;
}): void {
  trackMetaEvent('Lead', {
    content_category: leadData?.content_category || 'proposal',
    content_name: leadData?.content_name,
    value: leadData?.value,
    currency: 'NGN',
  });
}

/**
 * Track contact (WhatsApp clicks)
 */
export function trackContact(method?: string): void {
  trackMetaEvent('Contact', {
    content_category: method || 'whatsapp',
  });
}

/**
 * Track registration completion
 */
export function trackRegistration(method?: string): void {
  trackMetaEvent('CompleteRegistration', {
    content_name: method || 'email',
    status: 'complete',
  });
}
