/**
 * Selectors for Buy Passes page
 * Organized by sections for easy access and maintenance
 */

export const buyPassesSelectors = {
  // Main Container
  container: '[data-testid="buy-passes-container"]',
  
  // Title and Description Section
  title: {
    container: '[data-testid="buy-passes-title"]',
    description: '[data-testid="buy-passes-description"]',
  },

  // Balance Section
  balance: '[data-testid="balance-passes"]',

  // Toolbar Section
  toolbar: {
    container: '[data-testid="toolbar-container"]',
    top: '[data-testid="toolbar-top"]',
    left: '[data-testid="toolbar-left"]',
    right: '[data-testid="toolbar-right"]',
    addSpouseButton: '[data-testid="toolbar-add-spouse-button"]',
    addChildrenButton: '[data-testid="toolbar-add-children-button"]',
    editPassesButton: '[data-testid="toolbar-edit-passes-button"]',
    viewInvoicesButton: '[data-testid="toolbar-view-invoices-button"]',
    discountCodeRight: '[data-testid="toolbar-discount-code-right"]',
  },

  // Discount Code Section
  discountCode: {
    top: '[data-testid="discount-code-top"]',
    bottom: '[data-testid="discount-code-bottom"]',
    container: '[data-testid="discount-code-container"]',
    toggle: '[data-testid="discount-code-toggle"]',
    form: '[data-testid="discount-code-form"]',
    input: '[data-testid="discount-code-input"]',
    applyButton: '[data-testid="discount-code-apply-button"]',
    message: '[data-testid="discount-code-message"]',
  },

  // Banner Discount
  bannerDiscount: '[data-testid="banner-discount"]',

  // Special Product Section (Patreon)
  specialProduct: {
    container: '[data-testid="special-product-container"]',
  },

  // Attendees List
  attendees: {
    list: '[data-testid="attendees-list"]',
    ticket: (attendeeId: string | number) => `[data-testid="attendee-ticket-${attendeeId}"]`,
    // Individual attendee elements
    container: (attendeeId: string | number) => `[data-testid="attendee-ticket-container-${attendeeId}"]`,
    header: (attendeeId: string | number) => `[data-testid="attendee-header-${attendeeId}"]`,
    name: (attendeeId: string | number) => `[data-testid="attendee-name-${attendeeId}"]`,
    category: (attendeeId: string | number) => `[data-testid="attendee-category-${attendeeId}"]`,
    city: (attendeeId: string | number) => `[data-testid="attendee-city-${attendeeId}"]`,
    optionsMenuMobile: (attendeeId: string | number) => `[data-testid="attendee-options-menu-mobile-${attendeeId}"]`,
    optionsMenuDesktop: (attendeeId: string | number) => `[data-testid="attendee-options-menu-desktop-${attendeeId}"]`,
    products: (attendeeId: string | number) => `[data-testid="attendee-products-${attendeeId}"]`,
    noProducts: (attendeeId: string | number) => `[data-testid="attendee-no-products-${attendeeId}"]`,
    checkinCodeButton: (attendeeId: string | number) => `[data-testid="attendee-checkin-code-button-${attendeeId}"]`,
    // Local products collapsible
    localCollapsible: (attendeeId: string | number) => `[data-testid="attendee-local-collapsible-${attendeeId}"]`,
    localTrigger: (attendeeId: string | number) => `[data-testid="attendee-local-trigger-${attendeeId}"]`,
    localProducts: (attendeeId: string | number) => `[data-testid="attendee-local-products-${attendeeId}"]`,
    // Common products collapsible
    commonCollapsible: (attendeeId: string | number) => `[data-testid="attendee-common-collapsible-${attendeeId}"]`,
    commonTrigger: (attendeeId: string | number) => `[data-testid="attendee-common-trigger-${attendeeId}"]`,
    commonProducts: (attendeeId: string | number) => `[data-testid="attendee-common-products-${attendeeId}"]`,
    // Individual product
    product: (productId: string | number, attendeeId: string | number) => 
      `[data-testid="product-${productId}-attendee-${attendeeId}"]`,
  },

  // Product Details (individual product button)
  product: {
    button: (productId: string | number) => `[data-testid="product-button-${productId}"]`,
    name: (productId: string | number) => `[data-testid="product-name-${productId}"]`,
    dates: (productId: string | number) => `[data-testid="product-dates-${productId}"]`,
    infoIcon: (productId: string | number) => `[data-testid="product-info-icon-${productId}"]`,
    infoTooltip: (productId: string | number) => `[data-testid="product-info-tooltip-${productId}"]`,
    originalPrice: (productId: string | number) => `[data-testid="product-original-price-${productId}"]`,
    price: (productId: string | number) => `[data-testid="product-price-${productId}"]`,
    // Data attributes for querying state
    byId: (productId: string | number) => `[data-product-id="${productId}"]`,
    byName: (name: string) => `[data-product-name="${name}"]`,
    selected: '[data-product-selected="true"]',
    purchased: '[data-product-purchased="true"]',
  },

  // Total Purchase (Collapsible Cart)
  totalPurchase: {
    collapsible: '[data-testid="total-purchase-collapsible"]',
    trigger: '[data-testid="total-purchase-trigger"]',
    originalTotal: '[data-testid="total-purchase-original-total"]',
    total: '[data-testid="total-purchase-total"]',
    cartItems: '[data-testid="total-purchase-cart-items"]',
    cartProduct: (productId: string | number) => `[data-testid="cart-product-${productId}"]`,
    credit: '[data-testid="total-purchase-credit"]',
    noItems: '[data-testid="total-purchase-no-items"]',
  },

  // Total Floating Bar (Desktop)
  totalFloatingBar: {
    container: '[data-testid="total-floating-bar-container"]',
    originalTotal: '[data-testid="total-floating-bar-original-total"]',
    total: '[data-testid="total-floating-bar-total"]',
    reviewOrderButton: '[data-testid="total-floating-bar-review-order"]',
    confirmButton: '[data-testid="total-floating-bar-confirm-button"]',
  },

  // Waiver Checkbox
  waiverCheckbox: {
    container: '[data-testid="waiver-checkbox-container"]',
    input: '[data-testid="waiver-checkbox-input"]',
    label: '[data-testid="waiver-checkbox-label"]',
    link: '[data-testid="waiver-checkbox-link"]',
    infoIcon: '[data-testid="waiver-checkbox-info-icon"]',
    tooltip: '[data-testid="waiver-checkbox-tooltip"]',
  },

  // Complete Purchase Button
  completePurchaseButton: '[data-testid="complete-purchase-button"]',

  // Purchase Section (Static - when floatingBar is false)
  staticPurchase: {
    container: '[data-testid="static-purchase-section"]',
    totalPurchase: '[data-testid="total-purchase-static"]',
    waiverCheckbox: '[data-testid="waiver-checkbox-static"]',
    completePurchaseButton: '[data-testid="complete-purchase-button-static"]',
  },

  // Desktop Floating Bar
  desktop: {
    container: '[data-testid="desktop-floating-bar"]',
    floating: {
      container: '[data-testid="desktop-floating-bar-floating"]',
      waiverCheckbox: '[data-testid="waiver-checkbox-desktop-floating"]',
      totalFloatingBar: '[data-testid="total-floating-bar-desktop"]',
    },
    static: {
      container: '[data-testid="desktop-floating-bar-static"]',
      totalPurchase: '[data-testid="total-purchase-desktop-static"]',
      waiverCheckbox: '[data-testid="waiver-checkbox-desktop-static"]',
      completePurchaseButton: '[data-testid="complete-purchase-button-desktop-static"]',
    },
  },

  // Mobile Bottom Sheet
  mobile: {
    container: '[data-testid="mobile-bottom-sheet"]',
    modal: '[data-testid="mobile-bottom-sheet-modal"]',
    inline: '[data-testid="mobile-bottom-sheet-inline"]',
    totalPurchase: '[data-testid="total-purchase-mobile"]',
    waiverCheckbox: '[data-testid="waiver-checkbox-mobile"]',
    completePurchaseButton: '[data-testid="complete-purchase-button-mobile"]',
  },
} as const;

// Helper functions for easier access
export const getAttendeeSelector = (attendeeId: string | number) => ({
  container: buyPassesSelectors.attendees.container(attendeeId),
  header: buyPassesSelectors.attendees.header(attendeeId),
  name: buyPassesSelectors.attendees.name(attendeeId),
  category: buyPassesSelectors.attendees.category(attendeeId),
  city: buyPassesSelectors.attendees.city(attendeeId),
  products: buyPassesSelectors.attendees.products(attendeeId),
  localCollapsible: buyPassesSelectors.attendees.localCollapsible(attendeeId),
  localTrigger: buyPassesSelectors.attendees.localTrigger(attendeeId),
  localProducts: buyPassesSelectors.attendees.localProducts(attendeeId),
  commonCollapsible: buyPassesSelectors.attendees.commonCollapsible(attendeeId),
  commonTrigger: buyPassesSelectors.attendees.commonTrigger(attendeeId),
  commonProducts: buyPassesSelectors.attendees.commonProducts(attendeeId),
  checkinCodeButton: buyPassesSelectors.attendees.checkinCodeButton(attendeeId),
});

export const getProductSelector = (productId: string | number, attendeeId: string | number) => {
  return buyPassesSelectors.attendees.product(productId, attendeeId);
};
