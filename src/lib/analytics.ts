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
  | 'generate_lead'     // Submitting contact form/WhatsApp
  | 'modal_view'        // Modal displayed
  | 'modal_dismiss'     // Modal dismissed
  | 'modal_cta_click'   // CTA clicked in modal
  | 'proposal_accepted' // Proposal accepted by partner
  | 'proposal_rejected'; // Proposal rejected by partner

interface AnalyticsEvent {
  action: EventName;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export const sendEvent = ({ action, category, label, value, ...rest }: AnalyticsEvent) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
      try {
        sendGAEvent('event', action, {
          event_category: category,
          event_label: label,
          value: value,
          ...rest
        });
      } catch (error) {
        console.error('[Analytics] Failed to send GA event:', error);
      }
    }

    // Meta Pixel
    if ((window as any).fbq) {
      try {
        // Map standard GA events to FB Standard events where possible, otherwise Custom
        let fbEventName = 'CustomEvent';
        const fbParams = { content_category: category, content_name: label, value, ...rest };

        switch (action) {
          case 'add_to_cart':
            fbEventName = 'AddToCart';
            break;
          case 'view_item':
            fbEventName = 'ViewContent';
            break;
          case 'begin_checkout':
            fbEventName = 'InitiateCheckout';
            break;
          case 'generate_lead':
            fbEventName = 'Lead';
            break;
          case 'select_item':
          case 'view_item_list':
          case 'view_cart':
          default:
            fbEventName = 'CustomEvent'; // fallback
            // Add specific name for the custom event or keep generic? 
            // Often better to pass the action as the custom event name if it's not standard
            if (fbEventName === 'CustomEvent') {
               // We can use trackCustom with the specific action name
               (window as any).fbq('trackCustom', action, fbParams);
               return; 
            }
            break;
        }

        (window as any).fbq('track', fbEventName, fbParams);
        
      } catch (error) {
         console.error('[Analytics] Failed to send FB event:', error);
      }
    }
    
    console.log(`[Analytics] Sent event: ${action}`, { category, label, value, ...rest });
  }
};
