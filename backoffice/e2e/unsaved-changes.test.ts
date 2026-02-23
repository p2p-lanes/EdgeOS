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

const MOCK_PRODUCT = {
  id: "00000000-0000-0000-0000-000000000500",
  name: "Test Product",
  price: "100.00",
  description: null,
  category: "ticket",
  attendee_category: "main",
  duration_type: "full",
  is_active: true,
  max_quantity: null,
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
    const method = route.request().method()

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
    if (url.includes("/products") && method === "POST") {
      return route.fulfill({ json: MOCK_PRODUCT })
    }
    if (url.includes("/products") && method === "PUT") {
      return route.fulfill({ json: MOCK_PRODUCT })
    }
    if (url.includes(`/products/${MOCK_PRODUCT.id}`)) {
      return route.fulfill({ json: MOCK_PRODUCT })
    }
    if (url.includes("/products") && !url.includes("/products/")) {
      return route.fulfill({
        json: {
          results: [MOCK_PRODUCT],
          paging: { limit: 100, offset: 0, total: 1 },
        },
      })
    }
    if (url.includes("/pending-reviews")) {
      return route.fulfill({ json: EMPTY_LIST })
    }
    return route.fulfill({ json: EMPTY_LIST })
  })

  return page
}

describe("Unsaved Changes — No dialog after successful save", () => {
  test(
    "does NOT show unsaved changes dialog after creating a product",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForSelector('input[id="name"]', { timeout: 10000 })

      await page.locator('input[id="name"]').fill("New Product")
      await page.locator('input[id="price"]').fill("50.00")

      await page.locator('button[type="submit"]').first().click()

      await page.waitForURL("**/products?**", { timeout: 10000 })

      const dialog = page.locator("role=dialog")
      await pwExpect(dialog).not.toBeVisible()

      expect(page.url()).toContain("/products")

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "does NOT show unsaved changes dialog after updating a product",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/${MOCK_PRODUCT.id}/edit`)
      await page.waitForSelector('input[id="name"]', { timeout: 10000 })

      await page.locator('input[id="name"]').fill("Updated Product Name")

      await page.locator('button[type="submit"]').first().click()

      await page.waitForURL("**/products?**", { timeout: 10000 })

      const dialog = page.locator("role=dialog")
      await pwExpect(dialog).not.toBeVisible()

      expect(page.url()).toContain("/products")

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "DOES show unsaved changes dialog when navigating away without saving",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/products/new`)
      await page.waitForSelector('input[id="name"]', { timeout: 10000 })

      await page.locator('input[id="name"]').fill("Unsaved Product")

      await page.locator('a[href="/"]').first().click()

      const dialog = page.locator("role=dialog")
      await pwExpect(dialog).toBeVisible({ timeout: 5000 })
      await pwExpect(
        dialog.getByRole("heading", { name: "Unsaved changes" }),
      ).toBeVisible()

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})
