/**
 * Test selectors for Buy Passes functionality
 * Contains all data-testid selectors used in E2E and component testing
 */

import { expect } from '@playwright/test';

export const PassesSelectors = {
  // Main tabs
  tabs: {
    container: '[data-testid="passes-tabs"]',
    tabsList: '[data-testid="passes-tabs-list"]',
    yourPassesTab: '[data-testid="your-passes-tab"]',
    buyPassesTab: '[data-testid="buy-passes-tab"]',
    yourPassesContent: '[data-testid="your-passes-content"]',
    buyPassesContent: '[data-testid="buy-passes-content"]'
  },

  // Sidebar navigation
  sidebar: {
    passesButton: '[data-testid="sidebar-passes-button"]',
    applicationButton: '[data-testid="sidebar-application-button"]',
    attendeeDirectoryButton: '[data-testid="sidebar-attendee-directory-button"]'
  },

  // Buy Passes page
  buyPasses: {
    container: '[data-testid="buy-passes-container"]',
    title: '[data-testid="buy-passes-title"]',
    balancePasses: '[data-testid="balance-passes"]',
    toolbarContainer: '[data-testid="toolbar-container"]',
    bannerDiscount: '[data-testid="banner-discount"]',
    attendeesContainer: '[data-testid="attendees-container"]'
  },

  // Special products
  specialProduct: {
    container: '[data-testid="special-product-container"]',
    product: '[data-testid="special-product"]'
  },

  // Discount Code functionality
  discountCode: {
    container: '[data-testid="discount-code-container"]',
    haveCouponTrigger: '[data-testid="have-coupon-trigger"]',
    form: '[data-testid="discount-code-form"]',
    input: '[data-testid="discount-code-input"]',
    applyButton: '[data-testid="apply-discount-button"]',
    message: '[data-testid="discount-message"]',
    topPosition: '[data-testid="discount-code-top"]',
    bottomPosition: '[data-testid="discount-code-bottom"]'
  },

  // Purchase sections
  purchase: {
    // Static purchase section
    staticSection: '[data-testid="static-purchase-section"]',
    staticTotal: '[data-testid="total-purchase-static"]',
    staticWaiver: '[data-testid="waiver-checkbox-static"]',
    staticButtonContainer: '[data-testid="purchase-button-container-static"]',
    staticCompleteButton: '[data-testid="complete-purchase-button-static"]',

    // Desktop floating purchase section
    desktopSection: '[data-testid="desktop-floating-purchase-section"]',
    desktopBottomSheet: '[data-testid="desktop-bottom-sheet"]',
    floatingContainer: '[data-testid="floating-purchase-container"]',
    totalFloatingBar: '[data-testid="total-floating-bar"]',
    waiverFloating: '[data-testid="waiver-checkbox-floating"]',
    desktopFixedContainer: '[data-testid="desktop-fixed-purchase-container"]',
    desktopTotal: '[data-testid="total-purchase-desktop"]',
    desktopWaiver: '[data-testid="waiver-checkbox-desktop"]',
    desktopButtonContainer: '[data-testid="purchase-button-container-desktop"]',
    desktopCompleteButton: '[data-testid="complete-purchase-button-desktop"]',

    // Mobile purchase section
    mobileSection: '[data-testid="mobile-purchase-section"]',
    mobileBottomSheet: '[data-testid="mobile-bottom-sheet"]',
    mobileContainer: '[data-testid="mobile-purchase-container"]',
    mobileTotal: '[data-testid="total-purchase-mobile"]',
    mobileWaiver: '[data-testid="waiver-checkbox-mobile"]',
    mobileButtonContainer: '[data-testid="purchase-button-container-mobile"]',
    mobileCompleteButton: '[data-testid="complete-purchase-button-mobile"]'
  },

  // Total Purchase component
  totalPurchase: {
    collapsible: '[data-testid="total-purchase-collapsible"]',
    trigger: '[data-testid="total-purchase-trigger"]',
    content: '[data-testid="total-purchase-content"]',
    priceDisplay: '[data-testid="total-price-display"]',
    originalTotal: '[data-testid="original-total"]',
    finalTotal: '[data-testid="final-total"]',
    productsCartList: '[data-testid="products-cart-list"]',
    noPassesSelected: '[data-testid="no-passes-selected"]',

    // Discount sections
    discountWeekPurchased: '[data-testid="discount-week-purchased"]',
    discountCouponTotal: '[data-testid="discount-coupon-total"]',
    discountCouponDisplay: '[data-testid="discount-coupon-display"]',
    discountLabel: '[data-testid="discount-label"]',
    discountAmount: '[data-testid="discount-amount"]',

    // Application credit
    applicationCredit: '[data-testid="application-credit"]',
    creditAmount: '[data-testid="credit-amount"]',

    // Dynamic product cart items
    productCart: (productId: string | number) => `[data-testid="product-cart-${productId}"]`
  },

  // Attendee ticket component
  attendeeTicket: {
    container: (attendeeId: string | number) => `[data-testid="attendee-ticket-container-${attendeeId}"]`,
    card: (attendeeId: string | number) => `[data-testid="attendee-card-${attendeeId}"]`,
    info: (attendeeId: string | number) => `[data-testid="attendee-info-${attendeeId}"]`,
    name: (attendeeId: string | number) => `[data-testid="attendee-name-${attendeeId}"]`,
    category: (attendeeId: string | number) => `[data-testid="attendee-category-${attendeeId}"]`,
    cityInfo: (attendeeId: string | number) => `[data-testid="city-info-${attendeeId}"]`,
    
    // Products section
    productsSection: (attendeeId: string | number) => `[data-testid="products-section-${attendeeId}"]`,
    productGroups: (attendeeId: string | number) => `[data-testid="product-groups-${attendeeId}"]`,
    comingSoonMessage: '[data-testid="coming-soon-message"]',

    // Local products
    localProducts: (attendeeId: string | number) => `[data-testid="local-products-${attendeeId}"]`,
    localProductsTrigger: (attendeeId: string | number) => `[data-testid="local-products-trigger-${attendeeId}"]`,
    localProductsContent: (attendeeId: string | number) => `[data-testid="local-products-content-${attendeeId}"]`,
    idRequiredNote: '[data-testid="id-required-note"]',

    // Common/Standard products
    commonProducts: (attendeeId: string | number) => `[data-testid="common-products-${attendeeId}"]`,
    commonProductsTrigger: (attendeeId: string | number) => `[data-testid="common-products-trigger-${attendeeId}"]`,
    commonProductsContent: (attendeeId: string | number) => `[data-testid="common-products-content-${attendeeId}"]`,

    // Individual products
    product: (productId: string | number, attendeeId: string | number) => `[data-testid="product-${productId}-${attendeeId}"]`,

    // Check-in functionality
    checkInSection: (attendeeId: string | number) => `[data-testid="check-in-section-${attendeeId}"]`,
    checkInButton: (attendeeId: string | number) => `[data-testid="check-in-button-${attendeeId}"]`
  }
} as const;

// Helper functions for common test scenarios

export const PassesTestHelpers = {
  /**
   * Get the main attendee ticket selector (assumes first attendee)
   */
  getMainAttendeeTicket: () => PassesSelectors.attendeeTicket.container('1'),

  /**
   * Get all product selectors for a specific attendee
   */
  getAttendeeProducts: (attendeeId: string | number) => ({
    localProducts: PassesSelectors.attendeeTicket.localProducts(attendeeId),
    commonProducts: PassesSelectors.attendeeTicket.commonProducts(attendeeId),
    localTrigger: PassesSelectors.attendeeTicket.localProductsTrigger(attendeeId),
    commonTrigger: PassesSelectors.attendeeTicket.commonProductsTrigger(attendeeId)
  }),

  /**
   * Navigate to Buy Passes with proper error handling and waiting
   */
  navigateToBuyPasses: async (page: any) => {
    const passesButton = page.locator(PassesSelectors.sidebar.passesButton);
    
    // Check if passes button exists and is enabled
    await expect(passesButton).toBeVisible();
    
    // Check if the button is enabled (application must be accepted)
    const isEnabled = await passesButton.isEnabled();
    if (!isEnabled) {
      throw new Error('Passes button is disabled. Application may not be accepted.');
    }
    
    // Click and wait for navigation
    await passesButton.click();
    await page.waitForURL('**/passes');
    
    // Click on Buy Passes tab
    await expect(page.locator(PassesSelectors.tabs.buyPassesTab)).toBeVisible();
    await page.locator(PassesSelectors.tabs.buyPassesTab).click();
    
    // Wait for content to load
    await expect(page.locator(PassesSelectors.buyPasses.container)).toBeVisible();
  },

  /**
   * Get purchase flow selectors based on device type
   */
  getPurchaseFlow: (deviceType: 'mobile' | 'desktop' | 'static' = 'desktop') => {
    switch (deviceType) {
      case 'mobile':
        return {
          section: PassesSelectors.purchase.mobileSection,
          total: PassesSelectors.purchase.mobileTotal,
          waiver: PassesSelectors.purchase.mobileWaiver,
          completeButton: PassesSelectors.purchase.mobileCompleteButton
        };
      case 'static':
        return {
          section: PassesSelectors.purchase.staticSection,
          total: PassesSelectors.purchase.staticTotal,
          waiver: PassesSelectors.purchase.staticWaiver,
          completeButton: PassesSelectors.purchase.staticCompleteButton
        };
      default: // desktop
        return {
          section: PassesSelectors.purchase.desktopSection,
          total: PassesSelectors.purchase.desktopTotal,
          waiver: PassesSelectors.purchase.desktopWaiver,
          completeButton: PassesSelectors.purchase.desktopCompleteButton
        };
    }
  },

  /**
   * Get discount code flow selectors
   */
  getDiscountFlow: () => ({
    trigger: PassesSelectors.discountCode.haveCouponTrigger,
    input: PassesSelectors.discountCode.input,
    applyButton: PassesSelectors.discountCode.applyButton,
    message: PassesSelectors.discountCode.message
  }),

  /**
   * Get total purchase flow selectors
   */
  getTotalPurchaseFlow: () => ({
    trigger: PassesSelectors.totalPurchase.trigger,
    finalTotal: PassesSelectors.totalPurchase.finalTotal,
    originalTotal: PassesSelectors.totalPurchase.originalTotal,
    discountAmount: PassesSelectors.totalPurchase.discountAmount
  })
};

// Type definitions for better TypeScript support
export type PassesSelectorKeys = keyof typeof PassesSelectors;
export type AttendeeId = string | number;
export type ProductId = string | number;
export type DeviceType = 'mobile' | 'desktop' | 'static';
