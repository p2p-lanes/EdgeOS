# RALPH-CHECKOUT: Checkout Flow Integration

## Context

**Project Location:** `/Users/tule/Repos/EdgeOS` (Next.js 15.5.7 frontend)
**API Location:** `/Users/tule/Repos/EdgeOS_API` (FastAPI backend)
**Design Reference:** `/Users/tule/Repos/ticketing-ui/magipatterns` (React component designs)

**Goal:** Port the checkout flow designed in magipatterns to the production EdgeOS app at `/{pop_up_slug}/passes`.

---

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **React:** 19.x
- **UI Library:** Radix UI components with shadcn/ui wrappers
- **Styling:** Tailwind CSS with custom design tokens
- **State Management:** React Context API (providers pattern)
- **HTTP Client:** Axios (`/src/api/index.js`)
- **Icons:** lucide-react

---

## Current Architecture (EdgeOS)

### Route Structure
```
src/app/portal/[popupSlug]/passes/
├── page.tsx              # Main tab interface (Your Passes / Buy Passes)
├── layout.tsx            # Wraps with TotalProvider
├── Tabs/
│   ├── BuyPasses.tsx     # Current purchase interface
│   └── YourPasses.tsx    # View purchased passes
├── components/
│   └── common/           # Reusable components
└── hooks/                # Pass-specific hooks
```

### Key Providers (order matters)
```
CityProvider → ApplicationProvider → PassesDataProvider →
GroupsProvider → PassesProvider → PoapsProvider → TotalProvider
```

### Existing Hooks
- `usePassesProvider()` - Core pass selection logic with strategies
- `useTotal()` - Cart total calculations
- `useApplication()` - User applications and attendees
- `useProductsData()` - Available products from API

### API Endpoints (from EdgeOS_API)
- `GET /popups/` - List popup cities
- `GET /products/?popup_city_id={id}` - Available products
- `GET /applications/?email={email}` - User applications
- `GET /payments/?application_id={id}` - Payment history
- `POST /payments/` - Create payment
- `POST /payments/preview` - Preview with discounts
- `GET /coupon-codes/?code={code}&popup_city_id={id}` - Validate coupon

---

## Design Reference (magipatterns)

### Components to Port

1. **PassSelectionStepSections** (`magipatterns/src/components/PassSelectionStepSections.tsx`)
   - Family member management (add spouse/child)
   - Pass type selection (weekly, month, day passes)
   - Mutual exclusivity rules (month vs weekly)
   - Early bird banner
   - Quantity steppers for day passes

2. **HousingStep** (`magipatterns/src/components/HousingStep.tsx`)
   - Date range picker with night counter
   - Property cards with room type selection
   - Price calculation based on nights

3. **MerchVariantA** (`magipatterns/src/components/MerchVariantA.tsx`)
   - Multiple layout variants (default, stacked, compact, card, detailed)
   - Quantity controls with +/- buttons
   - Discount badges and tooltips

4. **PatronStep** (`magipatterns/src/components/PatronStep.tsx`)
   - Expandable donation card
   - Preset amounts ($2500, $5000, $7500)
   - Custom amount input with minimum validation

5. **ConfirmStep** (`magipatterns/src/components/ConfirmStep.tsx`)
   - Order summary by category
   - Insurance toggle
   - Promo code input with validation
   - Grand total display

6. **CartFooter D1** (`magipatterns/src/components/CartFooter.tsx`)
   - Sticky dark footer with blur effect
   - Expandable cart drawer
   - Back/Continue navigation
   - Item removal capability

### Data Types
```typescript
// From magipatterns/src/types.ts
type PassCategory = 'main' | 'spouse' | 'child'
type PassType = 'week1' | 'week2' | 'week3' | 'week4' | 'month' | 'day'
type Step = 'passes' | 'housing' | 'merch' | 'patron' | 'confirm'

interface CartState {
  passes: SelectedPass[]
  housing: SelectedHousing | null
  merch: SelectedMerch[]
  patronAmount: number
  promoCode: string
  insurance: boolean
}
```

---

## Implementation Phases

### Phase 1: Port Types and Data Models
**Files to create/modify:**
- `src/types/checkout.ts` - New types (CartState, Step, etc.)
- `src/types/Products.ts` - Extend existing if needed

**Checkpoint:**
- [ ] Types compile without errors
- [ ] Types align with API response shapes

---

### Phase 2: Port PassSelectionStepSections
**Files to create:**
- `src/app/portal/[popupSlug]/passes/components/checkout/PassSelectionSection.tsx`

**Integration points:**
- Use `usePassesProvider()` for attendee/pass selection
- Use `useProductsData()` for available products
- Match existing `ProductStrategies` pattern for selection logic

**Checkpoint:**
- [ ] Component renders correctly
- [ ] Pass selection updates provider state
- [ ] Mutual exclusivity rules work
- [ ] Responsive on mobile

---

### Phase 3: Port HousingStep
**Files to create:**
- `src/app/portal/[popupSlug]/passes/components/checkout/HousingStep.tsx`

**Note:** EdgeOS may not have housing products - check API. If not available, implement as placeholder or skip.

**Checkpoint:**
- [ ] Date pickers work correctly
- [ ] Property cards display
- [ ] Price calculates based on nights
- [ ] "Skip" option works

---

### Phase 4: Port MerchVariantA
**Files to create:**
- `src/app/portal/[popupSlug]/passes/components/checkout/MerchSection.tsx`

**Note:** Check if merch products exist in EdgeOS. Use `category` filter on products endpoint.

**Checkpoint:**
- [ ] Merch items display with correct layout
- [ ] Quantity controls work
- [ ] Prices update correctly

---

### Phase 5: Port PatronStep
**Files to create:**
- `src/app/portal/[popupSlug]/passes/components/checkout/PatronSection.tsx`

**Integration:** Look for "Patreon" or patron products in EdgeOS (existing code references Patreon benefits).

**Checkpoint:**
- [ ] Expandable card works
- [ ] Preset amounts selectable
- [ ] Custom amount validates minimum

---

### Phase 6: Port ConfirmStep
**Files to create:**
- `src/app/portal/[popupSlug]/passes/components/checkout/ConfirmStep.tsx`

**Integration points:**
- Use existing `DiscountCode` component or port from magipatterns
- Use `POST /payments/preview` for summary calculation
- Use `useTotal()` for grand total

**Checkpoint:**
- [ ] Order summary displays all items
- [ ] Promo code validation works
- [ ] Insurance toggle updates total
- [ ] Grand total matches preview

---

### Phase 7: Port CartFooter D1
**Files to create:**
- `src/app/portal/[popupSlug]/passes/components/checkout/CartFooter.tsx`

**Replace:** Current `TotalFloatingBar.tsx` and mobile bottom sheet

**Features:**
- Dark theme (`bg-gray-900/95`)
- Backdrop blur
- Expandable drawer
- Back/Continue/Pay buttons
- Item removal

**Checkpoint:**
- [ ] Footer is sticky at bottom
- [ ] Drawer expands/collapses
- [ ] Navigation works
- [ ] Item removal updates state
- [ ] Responsive behavior correct

---

### Phase 8: Wire to Real API
**Files to modify:**
- `src/providers/passesProvider.tsx` - Extend for new cart state
- `src/hooks/usePurchaseProducts.ts` - Update for new flow

**API calls:**
- `POST /payments/preview` - Get calculated totals
- `POST /payments/` - Complete purchase
- `GET /coupon-codes/` - Validate promo codes

**Checkpoint:**
- [ ] Preview returns correct totals
- [ ] Purchase creates payment record
- [ ] Coupon validation works
- [ ] Error handling implemented

---

### Phase 9: Loading/Error States
**Files to modify:**
- All new components

**States to handle:**
- Loading spinner during API calls
- Error messages for failed requests
- Empty states (no products, no attendees)
- Success feedback (toast notifications)

**Checkpoint:**
- [ ] Loading states display correctly
- [ ] Errors show user-friendly messages
- [ ] Empty states have clear CTAs
- [ ] Success toasts appear

---

### Phase 10: E2E Testing
**Files to create:**
- `e2e/checkout.spec.ts` (Playwright)

**Test cases:**
1. Select passes for main attendee
2. Add spouse and select passes
3. Navigate through all steps
4. Apply promo code
5. Complete purchase
6. Error scenarios (invalid code, API failure)

**Checkpoint:**
- [ ] All E2E tests pass
- [ ] Tests run in CI

---

## Rules

1. **Match existing EdgeOS patterns**
   - Use existing providers and hooks where possible
   - Follow the strategy pattern for business logic
   - Use shadcn/ui components from `src/components/ui/`

2. **Use existing component library**
   - Cards, Tabs, Buttons from `src/components/ui/`
   - Motion animations from existing CardAnimation
   - Sonner for toast notifications

3. **Follow Next.js conventions**
   - Client components marked with `'use client'`
   - Use App Router patterns
   - Proper loading.tsx for suspense

4. **Reference magipatterns for design, don't copy blindly**
   - Adapt styling to EdgeOS design tokens
   - Use existing Tailwind config colors
   - Maintain consistent spacing

5. **Type safety**
   - All components fully typed
   - No `any` types
   - Proper null checks

---

## Success Criteria

- [ ] Full checkout flow works at `/{slug}/passes`
- [ ] Connected to real EdgeOS_API, not mocks
- [ ] All states handled (loading, error, empty)
- [ ] Mobile responsive
- [ ] E2E tests pass
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Matches existing EdgeOS visual style

---

## Prerequisites & Setup

### IMPORTANT: Application Status
Users **must have an approved application** to access the passes route. In local dev, ensure applications are set to `'accepted'` status:

```sql
-- Run via: docker compose exec -T postgres psql -U myuser -d edgeos_db
UPDATE applications SET status = 'accepted' WHERE status = 'draft';
```

### IMPORTANT: Demo Products Setup
The checkout flow requires products in these categories. If missing, create them:

```sql
-- Housing Products (category: 'housing')
INSERT INTO products (name, slug, price, compare_price, popup_city_id, description, category, attendee_category, is_active, exclusive, created_at, updated_at)
VALUES
('Shared Room - Week', 'housing-shared-week', 500, 600, 2, 'Shared accommodation for one week', 'housing', 'main', true, false, NOW(), NOW()),
('Private Room - Week', 'housing-private-week', 900, 1000, 2, 'Private room for one week', 'housing', 'main', true, false, NOW(), NOW()),
('Apartment - Week', 'housing-apartment-week', 1500, 1800, 2, 'Full apartment for one week', 'housing', 'main', true, false, NOW(), NOW());

-- Merch Products (category: 'merch')
INSERT INTO products (name, slug, price, compare_price, popup_city_id, description, category, attendee_category, is_active, exclusive, created_at, updated_at)
VALUES
('Edge City T-Shirt', 'merch-tshirt', 35, 45, 2, 'Official Edge City t-shirt', 'merch', 'main', true, false, NOW(), NOW()),
('Edge City Hoodie', 'merch-hoodie', 75, 90, 2, 'Premium Edge City hoodie', 'merch', 'main', true, false, NOW(), NOW()),
('Edge City Cap', 'merch-cap', 25, 30, 2, 'Adjustable cap with logo', 'merch', 'main', true, false, NOW(), NOW());

-- Patron Products (category: 'patreon') - multiple tiers
INSERT INTO products (name, slug, price, popup_city_id, description, category, attendee_category, is_active, exclusive, created_at, updated_at)
VALUES
('Patron - Builder', 'patron-builder', 2500, 2, 'Builder level support', 'patreon', 'main', true, false, NOW(), NOW()),
('Patron - Champion', 'patron-champion', 5000, 2, 'Champion level support', 'patreon', 'main', true, false, NOW(), NOW()),
('Patron Pass', 'patron-pass', 7500, 2, 'Top tier patron support', 'patreon', 'main', true, false, NOW(), NOW());
```

### Product Categories Reference
The API returns products filtered by category:
- `week`, `month`, `day` - Standard passes
- `housing` - Accommodation options
- `merch` - Merchandise items
- `patreon` - Patron/donation tiers

Filter products by category: `GET /products/?popup_city_id=2&category=housing`

---

## Dev Login (No Email Required)

Use the helper script to bypass email authentication:

```bash
# From EdgeOS directory
./dev-login.sh                           # Login as sofia.martinez@test.com
./dev-login.sh emily.johnson@hotmail.com # Login as different user
```

Then paste the output in browser console at `http://localhost:3000`.

**Demo Users Available:**
| Email | Application Status |
|-------|-------------------|
| sofia.martinez@test.com | accepted |
| emily.johnson@hotmail.com | accepted |
| camila.rojas@test.com | accepted |
| michael.smith@test.com | accepted |
| valentina.suarez@test.com | accepted |

---

## Quick Start Commands

```bash
# Start backend (from EdgeOS_API directory)
cd ~/Repos/EdgeOS_API && docker compose up -d

# Start frontend (from EdgeOS directory)
cd ~/Repos/EdgeOS && npm run dev

# Dev login (bypasses email)
./dev-login.sh

# Run tests
npm run test

# Type check
npm run type-check

# Build
npm run build
```

---

## Reference Files

### EdgeOS (Integration Target)
- Provider pattern: `src/providers/passesProvider.tsx`
- Strategy pattern: `src/strategies/ProductStrategies.ts`
- UI components: `src/components/ui/`
- API client: `src/api/index.js`
- Types: `src/types/`

### Magipatterns (Design Reference)
- Types: `magipatterns/src/types.ts`
- Data: `magipatterns/src/data.ts`
- Pass selection: `magipatterns/src/components/PassSelectionStepSections.tsx`
- Housing: `magipatterns/src/components/HousingStep.tsx`
- Merch: `magipatterns/src/components/MerchVariantA.tsx`
- Patron: `magipatterns/src/components/PatronStep.tsx`
- Confirm: `magipatterns/src/components/ConfirmStep.tsx`
- Footer: `magipatterns/src/components/CartFooter.tsx`

---

## Notes

### Access Requirements
- **Application must be approved** (`status = 'accepted'`) to access `/passes`
- User must be authenticated with valid JWT token
- Application must exist for the current popup city

### Existing EdgeOS Behavior
- The passes flow uses tabs ("Your Passes" / "Buy Passes")
- Consider whether to replace entirely or enhance the existing BuyPasses tab
- EdgeOS has existing discount/coupon functionality in `DiscountCode.tsx`
- Patreon benefits already exist in the codebase (free passes after patron purchase)

### Product Categories
- `attendee_category`: main, spouse, kid, teen, baby
- `category`: week, month, day, housing, merch, patreon
- Products must have `is_active = true` to appear in frontend
- `compare_price` shows strikethrough "original" price (early bird discount display)

### Database Schema Notes
- Popup city ID for Demo City: `2`
- Products are linked to popup cities via `popup_city_id`
- Applications link citizens to popup cities
- Attendees are created under applications

### Testing Checklist
Before testing the checkout flow, verify:
1. ✅ Backend running (`docker compose up -d`)
2. ✅ Frontend running (`npm run dev`)
3. ✅ User logged in (use `./dev-login.sh`)
4. ✅ Application status is 'accepted'
5. ✅ Products exist for all categories (week, month, day, housing, merch, patreon)
6. ✅ Products are marked `is_active = true`
