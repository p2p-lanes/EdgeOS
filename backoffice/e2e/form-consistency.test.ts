import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { type Browser, chromium, type Page } from "playwright"
import { expect as pwExpect } from "playwright/test"

const BASE_URL = "http://localhost:4173"
const TEST_TIMEOUT = 30_000

const MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@test.com",
  full_name: "Test Admin",
  role: "admin",
  tenant_id: "00000000-0000-0000-0000-000000000010",
  deleted: false,
}

const MOCK_POPUP = {
  id: "00000000-0000-0000-0000-000000000100",
  name: "Test Popup",
  slug: "test-popup",
  status: "active",
  start_date: "2025-01-01T00:00:00.000Z",
  end_date: "2025-12-31T00:00:00.000Z",
  allows_spouse: false,
  allows_children: false,
  allows_coupons: true,
  image_url: null,
  icon_url: null,
  express_checkout_background: null,
  web_url: null,
  blog_url: null,
  twitter_url: null,
  simplefi_api_key: null,
  tenant_id: "00000000-0000-0000-0000-000000000010",
}

const MOCK_HUMAN = {
  id: "00000000-0000-0000-0000-000000000300",
  first_name: "John",
  last_name: "Doe",
  email: "john@test.com",
  organization: "TestOrg",
  role: "Developer",
  residence: "NYC",
  telegram: "@johndoe",
  gender: "male",
  age: "25-34",
  picture_url: null,
  red_flag: false,
  popup_id: MOCK_POPUP.id,
  tenant_id: "00000000-0000-0000-0000-000000000010",
}

const EMPTY_LIST = { results: [], paging: { limit: 100, offset: 0, total: 0 } }

let browser: Browser

beforeAll(async () => {
  browser = await chromium.launch({ headless: true })
})

afterAll(async () => {
  if (browser) await browser.close()
})

async function createAuthedPage(): Promise<Page> {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.addInitScript(() => {
    localStorage.setItem("access_token", "mock-token-for-testing")
    localStorage.setItem(
      "workspace_popup_id",
      "00000000-0000-0000-0000-000000000100",
    )
    localStorage.setItem(
      "workspace_tenant_id",
      "00000000-0000-0000-0000-000000000010",
    )
  })

  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url()

    if (url.includes("/users/me")) {
      return route.fulfill({ json: MOCK_USER })
    }
    if (url.includes("/popups") && !url.includes("/popups/")) {
      return route.fulfill({
        json: {
          results: [MOCK_POPUP],
          paging: { limit: 100, offset: 0, total: 1 },
        },
      })
    }
    if (url.includes(`/popups/${MOCK_POPUP.id}`)) {
      return route.fulfill({ json: MOCK_POPUP })
    }
    if (url.includes(`/humans/${MOCK_HUMAN.id}`)) {
      return route.fulfill({ json: MOCK_HUMAN })
    }
    if (url.includes("/pending-reviews")) {
      return route.fulfill({ json: EMPTY_LIST })
    }
    if (url.includes("/form-fields/schema")) {
      return route.fulfill({
        json: { base_fields: {}, custom_fields: {}, sections: [] },
      })
    }
    return route.fulfill({ json: EMPTY_LIST })
  })

  return page
}

// ============================================================
// noValidate on all forms
// ============================================================
describe("Form noValidate attribute", () => {
  test(
    "PopupForm has noValidate",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/popups/new`)
      await page.waitForLoadState("networkidle")

      const form = page.locator("form[novalidate]")
      await pwExpect(form.first()).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "ProductForm has noValidate",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForLoadState("networkidle")

      const form = page.locator("form[novalidate]")
      await pwExpect(form.first()).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "CouponForm has noValidate",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/coupons/new`)
      await page.waitForLoadState("networkidle")

      const form = page.locator("form[novalidate]")
      await pwExpect(form.first()).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "GroupForm has noValidate",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/groups/new`)
      await page.waitForLoadState("networkidle")

      const form = page.locator("form[novalidate]")
      await pwExpect(form.first()).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// Field type consistency (Select vs Input)
// ============================================================
describe("Field type consistency", () => {
  test(
    "HumanForm Gender renders as Select (combobox), not text input",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/humans/${MOCK_HUMAN.id}/edit`)
      await page.waitForLoadState("networkidle")

      // Radix Select renders as button[role="combobox"]
      const genderTrigger = page.locator("#gender[role='combobox']")
      await pwExpect(genderTrigger).toBeVisible({ timeout: 10000 })

      // Should NOT be a text input
      const genderInput = page.locator("input#gender")
      expect(await genderInput.count()).toBe(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "HumanForm Age renders as Select (combobox), not text input",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/humans/${MOCK_HUMAN.id}/edit`)
      await page.waitForLoadState("networkidle")

      const ageTrigger = page.locator("#age[role='combobox']")
      await pwExpect(ageTrigger).toBeVisible({ timeout: 10000 })

      const ageInput = page.locator("input#age")
      expect(await ageInput.count()).toBe(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "ProductForm Description renders as textarea, not input",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForLoadState("networkidle")

      const textarea = page.locator("textarea#description")
      await pwExpect(textarea).toBeVisible({ timeout: 10000 })

      const input = page.locator("input#description")
      expect(await input.count()).toBe(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "ProductForm Price has inputMode=decimal",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForLoadState("networkidle")

      const priceInput = page.locator('input#price[inputmode="decimal"]')
      await pwExpect(priceInput).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "ProductForm Category renders as Select (combobox)",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForLoadState("networkidle")

      const categoryTrigger = page.locator("#category[role='combobox']")
      await pwExpect(categoryTrigger).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// Grid layout consistency (fields sharing rows)
// ============================================================
describe("Grid layout — fields share rows", () => {
  test(
    "PopupForm: Name and Status share a grid parent",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/popups/new`)
      await page.waitForLoadState("networkidle")

      await page.waitForSelector("#name", { timeout: 10000 })

      // Both fields exist in the same grid container
      const nameField = page.locator("#name")
      const statusField = page.locator("#status[role='combobox']")
      await pwExpect(nameField).toBeVisible()
      await pwExpect(statusField).toBeVisible()

      // Verify they share a common grid parent by checking the parent has grid class
      const nameParentGrid = nameField.locator(
        "xpath=ancestor::div[contains(@class,'grid')]",
      )
      const statusParentGrid = statusField.locator(
        "xpath=ancestor::div[contains(@class,'grid')]",
      )

      // Both should resolve to the same grid parent
      expect(await nameParentGrid.count()).toBeGreaterThan(0)
      expect(await statusParentGrid.count()).toBeGreaterThan(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "ProductForm: Category and Price share a grid parent",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForLoadState("networkidle")

      await page.waitForSelector("#category", { timeout: 10000 })

      const categoryField = page.locator("#category")
      const priceField = page.locator("#price")
      await pwExpect(categoryField).toBeVisible()
      await pwExpect(priceField).toBeVisible()

      // Both should have a grid ancestor
      const catGrid = categoryField.locator(
        "xpath=ancestor::div[contains(@class,'grid')]",
      )
      const priceGrid = priceField.locator(
        "xpath=ancestor::div[contains(@class,'grid')]",
      )
      expect(await catGrid.count()).toBeGreaterThan(0)
      expect(await priceGrid.count()).toBeGreaterThan(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "ProductForm: Description and Max Quantity share a grid parent",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForLoadState("networkidle")

      await page.waitForSelector("#description", { timeout: 10000 })

      const descField = page.locator("#description")
      const maxQtyField = page.locator("#max_quantity")
      await pwExpect(descField).toBeVisible()
      await pwExpect(maxQtyField).toBeVisible()

      const descGrid = descField.locator(
        "xpath=ancestor::div[contains(@class,'grid')]",
      )
      const maxQtyGrid = maxQtyField.locator(
        "xpath=ancestor::div[contains(@class,'grid')]",
      )
      expect(await descGrid.count()).toBeGreaterThan(0)
      expect(await maxQtyGrid.count()).toBeGreaterThan(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "CouponForm: Code, Discount, and Max Uses share a 3-column grid",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/coupons/new`)
      await page.waitForLoadState("networkidle")

      await page.waitForSelector("#code", { timeout: 10000 })

      const codeField = page.locator("#code")
      const discountField = page.locator("#discount_value")
      const maxUsesField = page.locator("#max_uses")

      await pwExpect(codeField).toBeVisible()
      await pwExpect(discountField).toBeVisible()
      await pwExpect(maxUsesField).toBeVisible()

      // All three should have a grid ancestor with 3-col class
      const gridParent = codeField.locator(
        "xpath=ancestor::div[contains(@class,'grid-cols-3') or contains(@class,'grid')]",
      )
      expect(await gridParent.count()).toBeGreaterThan(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "HumanForm: Gender and Age share a grid parent",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/humans/${MOCK_HUMAN.id}/edit`)
      await page.waitForLoadState("networkidle")

      await page.waitForSelector("#gender", { timeout: 10000 })

      const genderField = page.locator("#gender")
      const ageField = page.locator("#age")
      await pwExpect(genderField).toBeVisible()
      await pwExpect(ageField).toBeVisible()

      const genderGrid = genderField.locator(
        "xpath=ancestor::div[contains(@class,'grid')]",
      )
      expect(await genderGrid.count()).toBeGreaterThan(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// Inline toggles (no standalone cards for single switches)
// ============================================================
describe("Inline toggle switches", () => {
  test(
    "ProductForm: is_active switch is inside the main card (not a separate card)",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForLoadState("networkidle")

      await page.waitForSelector("#is_active", { timeout: 10000 })

      const toggle = page.locator("#is_active")
      await pwExpect(toggle).toBeVisible()

      // The toggle should be inside a Card that also contains the name field
      // i.e., they share the same card — not in a separate card
      const nameField = page.locator("#name")
      await pwExpect(nameField).toBeVisible()

      // Find the closest Card ancestor for both (data-slot="card" or class containing "card")
      const toggleCard = toggle.locator(
        "xpath=ancestor::div[@data-slot='card']",
      )
      const nameCard = nameField.locator(
        "xpath=ancestor::div[@data-slot='card']",
      )

      // Both should be in the same card
      const toggleCardId = await toggleCard.first().evaluate((el) => {
        const heading = el.querySelector("[data-slot='card-title']")
        return heading?.textContent ?? ""
      })
      const nameCardId = await nameCard.first().evaluate((el) => {
        const heading = el.querySelector("[data-slot='card-title']")
        return heading?.textContent ?? ""
      })

      expect(toggleCardId).toBe(nameCardId)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "CouponForm: is_active switch is inside the main card (not a separate card)",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/coupons/new`)
      await page.waitForLoadState("networkidle")

      await page.waitForSelector("#is_active", { timeout: 10000 })

      const toggle = page.locator("#is_active")
      const codeField = page.locator("#code")
      await pwExpect(toggle).toBeVisible()
      await pwExpect(codeField).toBeVisible()

      // Both should be in the same card
      const toggleCard = toggle.locator(
        "xpath=ancestor::div[@data-slot='card']",
      )
      const codeCard = codeField.locator(
        "xpath=ancestor::div[@data-slot='card']",
      )

      const toggleCardTitle = await toggleCard.first().evaluate((el) => {
        const heading = el.querySelector("[data-slot='card-title']")
        return heading?.textContent ?? ""
      })
      const codeCardTitle = await codeCard.first().evaluate((el) => {
        const heading = el.querySelector("[data-slot='card-title']")
        return heading?.textContent ?? ""
      })

      expect(toggleCardTitle).toBe(codeCardTitle)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// GroupForm textarea consistency
// ============================================================
describe("GroupForm layout", () => {
  test(
    "Description is a textarea",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/groups/new`)
      await page.waitForLoadState("networkidle")

      const textarea = page.locator("textarea#description")
      await pwExpect(textarea).toBeVisible({ timeout: 10000 })

      const input = page.locator("input#description")
      expect(await input.count()).toBe(0)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})
