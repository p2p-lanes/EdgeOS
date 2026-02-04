# Insurance Feature

## Overview

Products can now have optional insurance. Insurance is a percentage of the product's full price, configured per product by an admin. Users can opt in to insurance at payment time by setting `insurance: true` in the payment request.

When insurance is enabled:
- The insurance amount is calculated on the **full product price** (before any discounts)
- The insurance amount is added to the total payment amount **after** discounts are applied
- Discounts do not reduce the insurance cost

When insurance is disabled (default) or a product has no `insurance_percentage` configured, the behavior is unchanged.

---

## API Changes

### Products

#### `GET /products/`

Each product now includes:

| Field | Type | Description |
|-------|------|-------------|
| `insurance_percentage` | `float \| null` | The insurance rate as a percentage of the product price. `null` means insurance is not available for this product. |

Example response:
```json
{
  "id": 1,
  "name": "Standard Pass",
  "price": 500.0,
  "insurance_percentage": 5.0,
  ...
}
```

A product with `insurance_percentage: null` is unaffected by `insurance: true` in payment requests.

---

### Payments

#### `POST /payments/preview` and `POST /payments/`

**Request** — new field in `PaymentCreate`:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `insurance` | `bool` | `false` | Set to `true` to include insurance in the payment. |

Example request:
```json
{
  "application_id": 1,
  "products": [
    { "product_id": 1, "attendee_id": 10, "quantity": 1 }
  ],
  "insurance": true
}
```

**Response** — new field in `PaymentPreview`:

| Field | Type | Description |
|-------|------|-------------|
| `insurance_amount` | `float \| null` | Total insurance cost across all products. `null` when insurance is not applied. |

The `amount` field in the response already includes the insurance amount added on top of the discounted price.

Example response:
```json
{
  "application_id": 1,
  "amount": 525.0,
  "original_amount": 500.0,
  "insurance_amount": 25.0,
  "discount_value": 0,
  ...
}
```

---

#### `GET /payments/{id}`

**Response** — new fields in each `PaymentProductResponse` (inside `products_snapshot`):

| Field | Type | Description |
|-------|------|-------------|
| `insurance_applied` | `bool` | Whether insurance was applied to this specific product. |
| `insurance_price` | `float \| null` | The insurance cost for this product snapshot. `null` if insurance was not applied. |

Example:
```json
{
  "products_snapshot": [
    {
      "product_id": 1,
      "attendee_id": 10,
      "quantity": 1,
      "product_name": "Standard Pass",
      "product_price": 500.0,
      "insurance_applied": true,
      "insurance_price": 25.0,
      ...
    }
  ]
}
```

---

## Calculation Logic

For each product where `insurance_percentage` is not null and `insurance: true` is set:

```
insurance_price = product.price * quantity * insurance_percentage / 100
```

The total `insurance_amount` is the sum of all per-product insurance prices. This total is added to the payment `amount` after all discount calculations.

---

## Summary of New Fields

| Endpoint | Field | Type | Direction |
|----------|-------|------|-----------|
| `GET /products/` | `insurance_percentage` | `float \| null` | Response |
| `POST /payments/preview`, `POST /payments/` | `insurance` | `bool` | Request |
| `POST /payments/preview` | `insurance_amount` | `float \| null` | Response |
| `GET /payments/{id}` (`products_snapshot[]`) | `insurance_applied` | `bool` | Response |
| `GET /payments/{id}` (`products_snapshot[]`) | `insurance_price` | `float \| null` | Response |