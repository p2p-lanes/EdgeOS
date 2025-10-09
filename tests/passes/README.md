# Passes Tests

This directory contains end-to-end tests for the Passes module of the citizen-portal application.

## Structure

```
passes/
├── buy-passes-happy-path.spec.ts   # Happy path test for buying passes
└── README.md                       # This file
```

## Tests

### Buy Passes Happy Path

**File**: `buy-passes-happy-path.spec.ts`

**Purpose**: Tests the complete flow of navigating to the buy passes page and selecting a ticket.

**Current Coverage**:
- ✅ Authentication
- ✅ Navigation to passes page
- ✅ Clicking on Buy Passes tab
- ✅ Loading attendees list
- ✅ Selecting a ticket/product
- ✅ Verifying product appears in cart

**Future Coverage** (to be expanded):
- [ ] Applying discount codes
- [ ] Selecting multiple tickets
- [ ] Accepting waiver checkbox
- [ ] Completing purchase
- [ ] Adding spouse/children
- [ ] Viewing invoices

## Running Tests

### Run all passes tests
```bash
npx playwright test tests/passes
```

### Run specific test file
```bash
npx playwright test tests/passes/buy-passes-happy-path.spec.ts
```

### Run in UI mode (recommended for development)
```bash
npx playwright test tests/passes --ui
```

### Run with debug mode
```bash
npx playwright test tests/passes --debug
```

## Helper Functions

The test suite includes several helper functions for reliable interactions:

### `safeClick(page, selector)`
Safely clicks an element after scrolling into view and waiting for visibility.

### `safeFillInput(page, selector, value)`
Safely fills an input field after scrolling into view and waiting for visibility.

### `safeCheck(page, selector)`
Safely checks a checkbox after scrolling into view and waiting for visibility.

### `getFirstAttendeeId(page)`
Extracts the ID of the first attendee from the page.

### `getFirstAvailableProductId(page, attendeeId)`
Finds and returns the ID of the first available product for an attendee.
- Tries common products first
- Falls back to local products if common products don't exist
- Automatically expands collapsed sections

## Test Data

The tests use the following test data:
- **Event**: Edge Esmeralda
- **Authentication**: Uses `authenticateAsApplicationUser` from `tests/utils/auth.ts`

## Selectors

This test suite uses the organized selectors from:
- `tests/selectors/passes/buyPassesSelectors.ts`

For detailed selector documentation, see:
- `tests/selectors/passes/README.md`

## Best Practices

1. **Always use helper functions** for interactions to ensure reliability
2. **Wait for visibility** before interacting with elements
3. **Use appropriate timeouts** for async operations
4. **Verify state changes** after interactions
5. **Log important information** to console for debugging
6. **Keep tests focused** on single user flows

## Debugging

### Common Issues

**Issue**: Buy Passes container not visible
- Ensure you clicked on the "Buy Passes" tab first
- Wait for tabs to load before clicking
- Check if the page redirected correctly

**Issue**: Attendee list not loading
- Check if authentication is working
- Verify the user has access to the event
- Verify you're on the correct tab (Buy Passes)
- Check network tab for API errors

**Issue**: Products not found
- Verify the attendee has available products
- Check if products are in common or local sections
- Ensure collapsibles are being expanded

**Issue**: Cart not updating
- Wait for state changes after clicking products
- Verify the product selection logic
- Check console for JavaScript errors

### Debug Tips

1. Use `--headed` flag to see the browser
2. Add `await page.pause()` to pause execution
3. Use console.log to track test progress
4. Check screenshots in test-results directory
5. Enable trace recording with `--trace on`

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use the shared helper functions
3. Add descriptive test names
4. Update this README with new coverage
5. Ensure tests are idempotent
6. Clean up any test data created

## Related Files

- Selectors: `tests/selectors/passes/`
- Utils: `tests/utils/auth.ts`
- Component: `src/app/portal/[popupSlug]/passes/Tabs/BuyPasses.tsx`

