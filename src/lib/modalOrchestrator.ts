'use client';

/**
 * Modal Orchestrator - Smart frequency management for conversion modals
 * 
 * Features:
 * - Visit counting (first visit vs returning)
 * - Session-based modal history
 * - Global cooldown between modals
 * - Modal-specific display rules
 */

const STORAGE_KEY = 'tachpae_modal_state';
const SESSION_KEY = 'tachpae_modal_session';

export interface ModalHistory {
  visitCount: number;
  firstVisitDate: string;
  lastVisitDate: string;
  completedActions: string[]; // e.g., ['city_selected', 'cart_added', 'checkout_initiated']
  dismissedModals: string[]; // Modals user explicitly dismissed (don't show again this session)
  shownModals: Record<string, number>; // Modal ID -> timestamp last shown
}

export interface SessionState {
  sessionStart: number;
  modalsShownThisSession: string[];
  lastModalTime: number;
  cartOpenedAt: number | null;
  cartHasItems: boolean;
}

// Modal configuration
export const MODAL_CONFIG = {
  city_trust: {
    id: 'city_trust',
    maxPerSession: 1,
    showOnVisits: [1], // Only first visit
    cooldownMs: 0,
    requiresAction: 'city_selected',
  },
  send_your_item: {
    id: 'send_your_item',
    maxPerSession: 1,
    showOnVisits: [1, 2, 3, 4, 5], // First 5 visits
    cooldownMs: 30000, // 30 seconds after page load
    requiresAction: null,
  },
  upsell: {
    id: 'upsell',
    maxPerSession: 1,
    showOnVisits: 'all',
    cooldownMs: 15000,
    requiresAction: 'first_cart_add',
  },
  cart_abandonment: {
    id: 'cart_abandonment',
    maxPerSession: 1,
    showOnVisits: [2, 3, 4, 5, 6, 7, 8, 9, 10], // Second visit onwards
    cooldownMs: 45000, // 45 seconds after cart opened
    requiresAction: 'cart_has_items',
    excludeWith: ['valentine_link'], // Don't show if valentine_link already shown
  },
  valentine_link: {
    id: 'valentine_link',
    maxPerSession: 1,
    showOnVisits: [2, 3, 4, 5], // Second to fifth visits
    cooldownMs: 5000,
    requiresAction: null,
    excludeWith: ['cart_abandonment'], // Don't show if cart_abandonment already shown
  },
} as const;

export type ModalId = keyof typeof MODAL_CONFIG;

// Global cooldown between any modals (15 seconds)
const GLOBAL_COOLDOWN_MS = 15000;

/**
 * Get stored modal history from localStorage
 */
export function getModalHistory(): ModalHistory {
  if (typeof window === 'undefined') {
    return getDefaultHistory();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse modal history:', e);
  }
  
  return getDefaultHistory();
}

function getDefaultHistory(): ModalHistory {
  return {
    visitCount: 0,
    firstVisitDate: new Date().toISOString(),
    lastVisitDate: new Date().toISOString(),
    completedActions: [],
    dismissedModals: [],
    shownModals: {},
  };
}

/**
 * Save modal history to localStorage
 */
export function saveModalHistory(history: ModalHistory): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save modal history:', e);
  }
}

/**
 * Get session state from sessionStorage
 */
export function getSessionState(): SessionState {
  if (typeof window === 'undefined') {
    return getDefaultSession();
  }
  
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse session state:', e);
  }
  
  return getDefaultSession();
}

function getDefaultSession(): SessionState {
  return {
    sessionStart: Date.now(),
    modalsShownThisSession: [],
    lastModalTime: 0,
    cartOpenedAt: null,
    cartHasItems: false,
  };
}

/**
 * Save session state to sessionStorage
 */
export function saveSessionState(session: SessionState): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session state:', e);
  }
}

/**
 * Initialize visit tracking - call once on page load
 */
export function initializeVisitTracking(): { visitCount: number; isFirstVisit: boolean } {
  const history = getModalHistory();
  const session = getSessionState();
  
  // Check if this is a new session (no session data exists)
  const isNewSession = session.sessionStart === 0 || 
    (Date.now() - session.sessionStart > 30 * 60 * 1000); // 30 min session timeout
  
  if (isNewSession) {
    // Increment visit count for new sessions
    history.visitCount += 1;
    history.lastVisitDate = new Date().toISOString();
    saveModalHistory(history);
    
    // Reset session
    const newSession: SessionState = {
      sessionStart: Date.now(),
      modalsShownThisSession: [],
      lastModalTime: 0,
      cartOpenedAt: null,
      cartHasItems: false,
    };
    saveSessionState(newSession);
  }
  
  return {
    visitCount: history.visitCount,
    isFirstVisit: history.visitCount === 1,
  };
}

/**
 * Track a completed action
 */
export function trackAction(action: string): void {
  const history = getModalHistory();
  if (!history.completedActions.includes(action)) {
    history.completedActions.push(action);
    saveModalHistory(history);
  }
}

/**
 * Check if an action has been completed
 */
export function hasCompletedAction(action: string): boolean {
  const history = getModalHistory();
  return history.completedActions.includes(action);
}

/**
 * Track cart opened time
 */
export function trackCartOpened(): void {
  const session = getSessionState();
  session.cartOpenedAt = Date.now();
  saveSessionState(session);
}

/**
 * Update cart has items status
 */
export function updateCartHasItems(hasItems: boolean): void {
  const session = getSessionState();
  session.cartHasItems = hasItems;
  saveSessionState(session);
}

/**
 * Check if a modal should be shown based on all rules
 */
export function shouldShowModal(modalId: ModalId): boolean {
  const config = MODAL_CONFIG[modalId];
  const history = getModalHistory();
  const session = getSessionState();
  
  // 1. Check if already shown max times this session
  const shownCount = session.modalsShownThisSession.filter(id => id === modalId).length;
  if (shownCount >= config.maxPerSession) {
    return false;
  }
  
  // 2. Check visit eligibility
  if (config.showOnVisits !== 'all') {
    const allowedVisits = config.showOnVisits as readonly number[];
    if (!allowedVisits.includes(history.visitCount)) {
      return false;
    }
  }
  
  // 3. Check global cooldown
  if (session.lastModalTime > 0 && Date.now() - session.lastModalTime < GLOBAL_COOLDOWN_MS) {
    return false;
  }
  
  // 4. Check modal-specific cooldown
  if (config.cooldownMs > 0) {
    const modalLastShown = history.shownModals[modalId] || 0;
    if (Date.now() - modalLastShown < config.cooldownMs) {
      return false;
    }
  }
  
  // 5. Check required action
  if (config.requiresAction) {
    // Special case for cart_has_items - check session state
    if (config.requiresAction === 'cart_has_items') {
      if (!session.cartHasItems) return false;
    } else if (!history.completedActions.includes(config.requiresAction)) {
      return false;
    }
  }
  
  // 6. Check exclusion rules
  if ('excludeWith' in config && config.excludeWith) {
    for (const excludedModal of config.excludeWith) {
      if (session.modalsShownThisSession.includes(excludedModal)) {
        return false;
      }
    }
  }
  
  // 7. Check if user dismissed this modal
  if (history.dismissedModals.includes(modalId)) {
    return false;
  }
  
  return true;
}

/**
 * Record that a modal was shown
 */
export function recordModalShown(modalId: ModalId): void {
  const history = getModalHistory();
  const session = getSessionState();
  
  // Update history
  history.shownModals[modalId] = Date.now();
  saveModalHistory(history);
  
  // Update session
  session.modalsShownThisSession.push(modalId);
  session.lastModalTime = Date.now();
  saveSessionState(session);
}

/**
 * Record that a modal was dismissed by user
 */
export function recordModalDismissed(modalId: ModalId): void {
  const history = getModalHistory();
  if (!history.dismissedModals.includes(modalId)) {
    history.dismissedModals.push(modalId);
    saveModalHistory(history);
  }
}

/**
 * Check if user has items in cart from previous session
 */
export function checkReturningUserWithCart(cartItemCount: number): boolean {
  const history = getModalHistory();
  return history.visitCount >= 2 && cartItemCount > 0;
}

/**
 * Get time since cart was opened (for abandonment detection)
 */
export function getTimeSinceCartOpened(): number | null {
  const session = getSessionState();
  if (!session.cartOpenedAt) return null;
  return Date.now() - session.cartOpenedAt;
}

/**
 * Reset all modal tracking (for testing)
 */
export function resetAllModalTracking(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
