'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ModalId,
  initializeVisitTracking,
  shouldShowModal,
  recordModalShown,
  recordModalDismissed,
  trackAction,
  trackCartOpened,
  updateCartHasItems,
  getModalHistory,
  getSessionState,
  checkReturningUserWithCart,
  getTimeSinceCartOpened,
} from '@/lib/modalOrchestrator';

interface ModalContextType {
  // Current open modal (only one at a time)
  activeModal: ModalId | null;
  
  // Visit info
  visitCount: number;
  isFirstVisit: boolean;
  
  // Modal controls
  showModal: (modalId: ModalId) => boolean;
  hideModal: () => void;
  dismissModal: (modalId: ModalId) => void; // User explicitly closed
  
  // Action tracking
  trackUserAction: (action: string) => void;
  
  // Cart tracking
  onCartOpened: () => void;
  onCartItemsChanged: (count: number) => void;
  
  // Checks
  canShowModal: (modalId: ModalId) => boolean;
  isReturningUserWithCart: (cartCount: number) => boolean;
  getCartOpenDuration: () => number | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [activeModal, setActiveModal] = useState<ModalId | null>(null);
  const [visitCount, setVisitCount] = useState(1);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const { visitCount: count, isFirstVisit: first } = initializeVisitTracking();
    setVisitCount(count);
    setIsFirstVisit(first);
    setIsHydrated(true);
  }, []);

  const showModal = useCallback((modalId: ModalId): boolean => {
    if (!isHydrated) return false;
    
    // Check if we can show this modal
    if (!shouldShowModal(modalId)) {
      return false;
    }
    
    // Only one modal at a time
    if (activeModal !== null) {
      return false;
    }
    
    // Record and show
    recordModalShown(modalId);
    setActiveModal(modalId);
    return true;
  }, [activeModal, isHydrated]);

  const hideModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const dismissModal = useCallback((modalId: ModalId) => {
    recordModalDismissed(modalId);
    setActiveModal(null);
  }, []);

  const trackUserAction = useCallback((action: string) => {
    trackAction(action);
  }, []);

  const onCartOpened = useCallback(() => {
    trackCartOpened();
  }, []);

  const onCartItemsChanged = useCallback((count: number) => {
    updateCartHasItems(count > 0);
  }, []);

  const canShowModal = useCallback((modalId: ModalId): boolean => {
    if (!isHydrated) return false;
    return shouldShowModal(modalId);
  }, [isHydrated]);

  const isReturningUserWithCart = useCallback((cartCount: number): boolean => {
    return checkReturningUserWithCart(cartCount);
  }, []);

  const getCartOpenDuration = useCallback((): number | null => {
    return getTimeSinceCartOpened();
  }, []);

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        visitCount,
        isFirstVisit,
        showModal,
        hideModal,
        dismissModal,
        trackUserAction,
        onCartOpened,
        onCartItemsChanged,
        canShowModal,
        isReturningUserWithCart,
        getCartOpenDuration,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}
