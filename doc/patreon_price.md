# Variable-Price Products

Products can now support pay-what-you-want pricing. Users choose how much to pay within defined bounds.

## Detecting Variable-Price Products

A product is variable-price when `min_price` is set (not null).

```typescript
const isVariablePrice = (product: Product) => product.min_price !== null;
```

### Product Fields

| Field | Type | Description |
|-------|------|-------------|
| `price` | `float` | For variable-price: suggested amount. For fixed-price: the price. |
| `min_price` | `float \| null` | Minimum allowed amount. If set, product is variable-price. |
| `max_price` | `float \| null` | Maximum allowed amount. Optional cap. |

## Payment Flow

### Request: PaymentProduct

When purchasing a variable-price product, include `custom_amount`:

```json
{
  "application_id": 123,
  "products": [
    {
      "product_id": 1,
      "attendee_id": 456,
      "quantity": 1,
      "custom_amount": 75.00
    }
  ]
}
```

| Field | Type | Required |
|-------|------|----------|
| `product_id` | `int` | Always |
| `attendee_id` | `int` | Always |
| `quantity` | `int` | Always |
| `custom_amount` | `float \| null` | Required for variable-price products. Must be null/omitted for fixed-price. |

### Response: PaymentPreview

```json
{
  "original_amount": 175.00,
  "amount": 155.00,
  "variable_amount": 75.00,
  "discount_value": 20,
  "insurance_amount": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `original_amount` | `float` | Total before discounts (includes variable) |
| `amount` | `float` | Final amount to charge |
| `variable_amount` | `float \| null` | Sum of variable-price products. Null if none. |

## Validation Rules

### Variable-Price Products

- `custom_amount` is required
- `custom_amount >= min_price`
- `custom_amount <= max_price` (if max_price is set)

### Fixed-Price Products

- `custom_amount` must be null or omitted

### Error Responses (400)

```json
{"detail": "custom_amount is required for variable-price product: Product Name"}
{"detail": "custom_amount must be at least 10 for Product Name"}
{"detail": "custom_amount must be at most 500 for Product Name"}
{"detail": "custom_amount is not allowed for fixed-price product: Product Name"}
```

## Discount Behavior

- Discounts and coupons apply only to fixed-price products
- Variable-price amounts are never discounted
- `variable_amount` shows the undiscounted portion

### Example: Mixed Cart

Cart contains:
- Fixed-price product: $100 (20% discount applied)
- Variable-price product: custom_amount = $75

Result:
- `original_amount`: 175
- `variable_amount`: 75
- `amount`: 155 ($80 discounted + $75 variable)

## Insurance

Insurance can be enabled for variable-price products. The insurance amount is calculated based on `price` (suggested amount), not `custom_amount`.

## UI Recommendations

1. Show `price` as "Suggested amount" for variable-price products
2. Display input field for custom amount with min/max bounds
3. Pre-fill input with `price` value
4. Show `variable_amount` in cart breakdown to explain why discounts didn't reduce the full total
5. Validate bounds client-side before submission