# Passes Selectors

This directory contains organized selectors for testing the Passes module of the citizen-portal application.

## Structure

```
passes/
├── buyPassesSelectors.ts   # Selectors for the Buy Passes page
├── index.ts                # Export barrel file
└── README.md              # This file
```

## Usage

### Basic Import

```typescript
import { buyPassesSelectors } from '@/tests/selectors/passes';
```

### Examples

#### 1. Selecting Main Elements

```typescript
// Main container
await page.locator(buyPassesSelectors.container).waitFor();

// Title section
await page.locator(buyPassesSelectors.title.container).isVisible();
await page.locator(buyPassesSelectors.title.description).textContent();

// Balance section
await page.locator(buyPassesSelectors.balance).isVisible();
```

#### 2. Working with Discount Code

```typescript
// Toggle discount code section
await page.locator(buyPassesSelectors.discountCode.toggle).click();

// Fill discount code
await page.locator(buyPassesSelectors.discountCode.input).fill('TESTCODE');

// Apply discount
await page.locator(buyPassesSelectors.discountCode.applyButton).click();

// Check message
const message = await page.locator(buyPassesSelectors.discountCode.message).textContent();
```

#### 3. Working with Attendees

```typescript
// Using helper function
const attendeeId = '123';
const attendeeSelectors = getAttendeeSelector(attendeeId);

// Check attendee name
await page.locator(attendeeSelectors.name).textContent();

// Toggle common products
await page.locator(attendeeSelectors.commonTrigger).click();

// Select a specific product
const productId = '456';
await page.locator(getProductSelector(productId, attendeeId)).click();
```

#### 4. Working with Cart/Total Purchase

```typescript
// Open cart
await page.locator(buyPassesSelectors.totalPurchase.trigger).click();

// Check total
const total = await page.locator(buyPassesSelectors.totalPurchase.total).textContent();

// Verify cart items
await page.locator(buyPassesSelectors.totalPurchase.cartItems).isVisible();
```

#### 5. Complete Purchase Flow

```typescript
// 1. Select a product
await page.locator(getProductSelector('456', '123')).click();

// 2. Accept waiver
await page.locator(buyPassesSelectors.waiverCheckbox.input).check();

// 3. Click complete purchase
await page.locator(buyPassesSelectors.completePurchaseButton).click();
```

#### 6. Mobile vs Desktop

```typescript
// Desktop floating bar
if (isDesktop) {
  await page.locator(buyPassesSelectors.desktop.floating.container).isVisible();
  await page.locator(buyPassesSelectors.desktop.floating.totalFloatingBar).isVisible();
}

// Mobile bottom sheet
if (isMobile) {
  await page.locator(buyPassesSelectors.mobile.container).isVisible();
  await page.locator(buyPassesSelectors.mobile.totalPurchase).isVisible();
}
```

## Selector Organization

### Main Sections

1. **Container**: Main page container
2. **Title & Description**: Page header and information
3. **Balance**: Current balance display
4. **Toolbar**: Action buttons (Add children, View Invoices, etc.)
5. **Discount Code**: Coupon application section
6. **Banner Discount**: Discount information banner
7. **Special Product**: Patreon/special product section
8. **Attendees List**: List of attendees and their tickets
9. **Total Purchase**: Cart/checkout collapsible
10. **Waiver Checkbox**: Terms acceptance checkbox
11. **Complete Purchase Button**: Final purchase button
12. **Desktop/Mobile Variants**: Platform-specific elements

### Attendee Elements

For each attendee, you can access:
- Container, Header, Name, Category, City
- Options menus (mobile/desktop)
- Products section
- Local products collapsible
- Common products collapsible
- Individual products
- Check-in code button

### Helper Functions

#### `getAttendeeSelector(attendeeId)`
Returns an object with all selectors for a specific attendee.

```typescript
const selectors = getAttendeeSelector('123');
// Returns: { container, header, name, category, city, products, ... }
```

#### `getProductSelector(productId, attendeeId)`
Returns the selector for a specific product of an attendee.

```typescript
const selector = getProductSelector('456', '123');
// Returns: '[data-testid="product-456-attendee-123"]'
```

## Test Example

```typescript
import { test, expect } from '@playwright/test';
import { buyPassesSelectors, getAttendeeSelector, getProductSelector } from '@/tests/selectors/passes';

test.describe('Buy Passes', () => {
  test('should select a ticket and complete purchase', async ({ page }) => {
    // Navigate to passes page
    await page.goto('/portal/edge-esmeralda/passes');
    
    // Wait for page to load
    await page.locator(buyPassesSelectors.container).waitFor();
    
    // Get attendee selectors
    const attendeeId = 'john-doe-id';
    const attendee = getAttendeeSelector(attendeeId);
    
    // Open common products
    await page.locator(attendee.commonTrigger).click();
    
    // Select a product
    const productId = 'weekend-day-id';
    await page.locator(getProductSelector(productId, attendeeId)).click();
    
    // Verify total is updated
    const total = await page.locator(buyPassesSelectors.totalPurchase.total).textContent();
    expect(total).not.toBe('$0');
    
    // Accept waiver
    await page.locator(buyPassesSelectors.waiverCheckbox.input).check();
    
    // Complete purchase
    await page.locator(buyPassesSelectors.completePurchaseButton).click();
    
    // Verify success
    // Add your success verification here
  });
});
```

## Tips

1. **Use helper functions** when working with dynamic IDs (attendees, products)
2. **Check visibility** before interacting with elements
3. **Use waitFor()** for elements that may load asynchronously
4. **Combine selectors** with Playwright's chaining for complex queries
5. **Test both mobile and desktop** variants when applicable

## Contributing

When adding new test IDs to components:

1. Follow the naming convention: `[component]-[element]-[modifier]`
2. Update the selectors file
3. Add helper functions if needed
4. Update this README with examples
5. Keep selectors organized by section

## Related Files

- Component: `src/app/portal/[popupSlug]/passes/Tabs/BuyPasses.tsx`
- Subcomponents:
  - `AttendeeTicket.tsx`
  - `DiscountCode.tsx`
  - `TotalPurchase.tsx`
  - `TotalFloatingBar.tsx`
  - `WaiverCheckbox.tsx`
  - `CompletePurchaseButton.tsx`

