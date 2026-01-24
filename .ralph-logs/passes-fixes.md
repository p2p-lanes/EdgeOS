# Bug Fixes and Improvements for Passes & Checkout Flow

## Implementation Status

### Phase 0: Revert magipatterns changes
- [x] Reverted all changes in `/Users/tule/Repos/ticketing-ui/magipatterns`

### Phase 1: YourPasses.tsx changes
- [x] Removed patreon product rendering block
- [x] Removed `specialProduct` variable assignment
- [x] Removed `Special` and `Separator` imports
- [x] Changed spouse button to disabled instead of hidden

### Phase 2: Rename /checkout to /buy
- [x] Renamed directory `src/app/portal/[popupSlug]/checkout/` → `src/app/portal/[popupSlug]/buy/`
- [x] Updated navigation in `passes/page.tsx`
- [x] Updated references in `usePurchaseProducts.ts`
- [x] Added router navigation and `onBack` handler to `buy/page.tsx`

### Phase 3: MerchSection.tsx fixes
- [x] Changed subtotal color from green to gray when no items selected
- [x] Fixed tooltip positioning from `right-0` to `left-1/2 -translate-x-1/2`
- [x] Fixed tooltip arrow positioning

### Phase 4: ConfirmStep.tsx fixes
- [x] Changed placeholder from "Promo code (optional)" to "Promo code"
- [x] Added uppercase conversion on input change
- [x] Improved Apply button spacing (gap-2 → gap-3, added flex-shrink-0)

### Phase 5: CartFooter.tsx fixes
- [x] Added click-outside backdrop to close cart modal
- [x] Added `relative z-30` to expanded cart drawer

### Phase 6: CheckoutFlow.tsx breadcrumb
- [x] Added ChevronRight import from lucide-react
- [x] Added breadcrumb header showing "City > Passes > Buy"

---

## Testing Checklist

### Desktop Tests (1280x800)
| Test | Status |
|------|--------|
| No "Patron - Builder" on /passes | ⬜ |
| "Add spouse" button disabled (not hidden) when spouse exists | ⬜ |
| Back button from /buy first step → /passes | ⬜ |
| Merch subtotal shows gray (not green) without quantity | ⬜ |
| Tooltips display properly centered | ⬜ |
| Promo code input uppercase conversion | ⬜ |
| Apply button has proper spacing | ⬜ |
| Cart modal closes on outside click | ⬜ |
| Breadcrumb shows "City > Passes > Buy" | ⬜ |
| URL is /buy (not /checkout) | ⬜ |
| TEST100 coupon applies 100% discount | ⬜ |
| After purchase, passes show in /passes | ⬜ |

### Mobile Tests (375x667)
| Test | Status |
|------|--------|
| Merch subtotal gray (not green) | ⬜ |
| Tooltips don't go off-screen left | ⬜ |
| Apply button doesn't touch card edge | ⬜ |
| Promo code placeholder is "Promo code" | ⬜ |
| Input converts to uppercase | ⬜ |
| Cart modal closes on outside tap | ⬜ |
| Back navigation works | ⬜ |
| Sticky footer functional | ⬜ |
| Full purchase flow completes | ⬜ |

---

## Files Modified

| File | Changes |
|------|---------|
| `passes/Tabs/YourPasses.tsx` | Removed patreon product, disabled spouse button |
| `buy/page.tsx` (renamed from checkout) | Added back navigation |
| `passes/components/checkout/MerchSection.tsx` | Fixed subtotal color, fixed tooltip positioning |
| `passes/components/checkout/ConfirmStep.tsx` | Updated placeholder, uppercase input, button spacing |
| `passes/components/checkout/CartFooter.tsx` | Added click-outside backdrop |
| `passes/components/checkout/CheckoutFlow.tsx` | Added breadcrumb header |
| `passes/page.tsx` | Updated navigation to /buy |
| `passes/hooks/usePurchaseProducts.ts` | Updated /checkout to /buy |

---

## Notes
- All changes implemented successfully
- Ready for manual testing
- TEST100 coupon functionality depends on backend configuration
