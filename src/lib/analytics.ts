import { sendGAEvent } from '@next/third-parties/google';

type EventName = 
  | 'view_item'         // Product Details Check
  | 'select_item'       // Clicking a product card
  | 'add_to_cart'       // Adding item to cart
  | 'view_cart'         // Opening cart
  | 'begin_checkout'    // Clicking checkout
  | 'view_item_list'    // Viewing a specific category/list
  | 'select_promotion'  // Clicking specials/banner
  | 'share'             // Sharing wishlist
  | 'generate_lead';    // Submitting contact form/WhatsApp

interface AnalyticsEvent {
  action: EventName;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export const sendEvent = ({ action, category, label, value, ...rest }: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    try {
      sendGAEvent('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...rest
      });
      console.log(`[Analytics] Sent event: ${action}`, { category, label, value, ...rest });
    } catch (error) {
      console.error('[Analytics] Failed to send event:', error);
    }
  }
};
