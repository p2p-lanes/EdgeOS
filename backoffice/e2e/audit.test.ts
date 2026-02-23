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

const MOCK_APPLICATION = {
  id: "00000000-0000-0000-0000-000000000200",
  status: "in review",
  red_flag: false,
  referral: null,
  custom_fields: {},
  submitted_at: "2025-06-01T10:00:00.000Z",
  accepted_at: null,
  human: {
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
  },
  attendees: [],
  popup_id: MOCK_POPUP.id,
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
    if (url.includes("/reviews/summary")) {
      return route.fulfill({
        json: {
          total_reviews: 0,
          yes_count: 0,
          no_count: 0,
          strong_yes_count: 0,
          strong_no_count: 0,
          weighted_score: null,
          reviews: [],
        },
      })
    }
    if (url.includes("/pending-reviews")) {
      return route.fulfill({ json: EMPTY_LIST })
    }
    if (
      url.includes(`/applications/${MOCK_APPLICATION.id}`) &&
      !url.includes("/reviews")
    ) {
      return route.fulfill({ json: MOCK_APPLICATION })
    }
    if (url.includes("/applications") && !url.includes("/applications/")) {
      return route.fulfill({
        json: {
          results: [MOCK_APPLICATION],
          paging: { limit: 100, offset: 0, total: 1 },
        },
      })
    }
    if (url.includes("/approval-strategies")) {
      return route.fulfill({ status: 404, json: { detail: "Not found" } })
    }
    if (url.includes("/form-fields/schema")) {
      return route.fulfill({
        json: { base_fields: {}, custom_fields: {}, sections: [] },
      })
    }
    if (url.includes("/payments")) {
      return route.fulfill({
        json: {
          results: [
            {
              id: "pay-001",
              amount: 100,
              currency: "USD",
              status: "pending",
              source: "stripe",
              coupon_code: null,
              checkout_url: null,
              external_id: "ext-001",
              rate: null,
              discount_value: null,
              products_snapshot: [],
              created_at: "2025-01-01T00:00:00Z",
              updated_at: null,
            },
          ],
          paging: { limit: 100, offset: 0, total: 1 },
        },
      })
    }
    return route.fulfill({ json: EMPTY_LIST })
  })

  return page
}

// ============================================================
// Login Page Polish (P3)
// ============================================================
describe("Login Page Polish", () => {
  test(
    "shows step indicator dots and tagline",
    async () => {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      })
      const page = await context.newPage()

      await page.goto(`${BASE_URL}/login`)
      await page.waitForLoadState("networkidle")

      await pwExpect(page.getByText("Login to Your Account")).toBeVisible()
      await pwExpect(page.getByTestId("email-input")).toBeVisible()
      await pwExpect(page.getByText("Manage your events")).toBeVisible()

      const dots = page.locator(".rounded-full.h-1\\.5")
      expect(await dots.count()).toBe(2)

      await context.close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// Unsaved Changes Dialog (P0)
// ============================================================
describe("Unsaved Changes Dialog", () => {
  test(
    "shows dialog when navigating away from dirty form",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/popups/${MOCK_POPUP.id}/edit`)
      await page.waitForSelector('input[id="name"]', { timeout: 10000 })

      await page.locator('input[id="name"]').fill("Changed Name")

      await page.locator('a[href="/"]').first().click()

      const dialog = page.locator("role=dialog")
      await pwExpect(dialog).toBeVisible({ timeout: 5000 })
      await pwExpect(
        dialog.getByRole("heading", { name: "Unsaved changes" }),
      ).toBeVisible()
      await pwExpect(dialog.getByText("Stay on page")).toBeVisible()
      await pwExpect(dialog.getByText("Discard changes")).toBeVisible()

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "stays on page when clicking 'Stay on page'",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/popups/${MOCK_POPUP.id}/edit`)
      await page.waitForSelector('input[id="name"]', { timeout: 10000 })

      await page.locator('input[id="name"]').fill("Changed Name")
      await page.locator('a[href="/"]').first().click()

      const dialog = page.locator("role=dialog")
      await pwExpect(dialog).toBeVisible({ timeout: 5000 })

      await dialog.getByText("Stay on page").click()
      await pwExpect(dialog).not.toBeVisible()
      expect(await page.locator('input[id="name"]').inputValue()).toBe(
        "Changed Name",
      )

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "navigates away when clicking 'Discard changes'",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/popups/${MOCK_POPUP.id}/edit`)
      await page.waitForSelector('input[id="name"]', { timeout: 10000 })

      await page.locator('input[id="name"]').fill("Changed Name")
      await page.locator('a[href="/"]').first().click()

      const dialog = page.locator("role=dialog")
      await pwExpect(dialog).toBeVisible({ timeout: 5000 })

      await dialog.getByText("Discard changes").click()
      await page.waitForURL("**/", { timeout: 5000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// Command Palette (P2)
// ============================================================
describe("Command Palette", () => {
  test(
    "opens with Ctrl+K and shows nav items",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/`)
      await page.waitForLoadState("networkidle")

      await page.keyboard.press("Control+k")

      const cmdRoot = page.locator("[cmdk-root]")
      await pwExpect(cmdRoot).toBeVisible({ timeout: 5000 })
      await pwExpect(cmdRoot.getByText("Dashboard")).toBeVisible()
      await pwExpect(cmdRoot.getByText("Popups")).toBeVisible()

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "filters items when typing",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/`)
      await page.waitForLoadState("networkidle")

      await page.keyboard.press("Control+k")
      const input = page.locator("[cmdk-input]")
      await pwExpect(input).toBeVisible({ timeout: 5000 })

      await input.fill("pop")
      await pwExpect(
        page.locator("[cmdk-root]").getByText("Popups"),
      ).toBeVisible()

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "closes on Escape",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/`)
      await page.waitForLoadState("networkidle")

      await page.keyboard.press("Control+k")
      const cmdRoot = page.locator("[cmdk-root]")
      await pwExpect(cmdRoot).toBeVisible({ timeout: 5000 })

      await page.keyboard.press("Escape")
      await pwExpect(cmdRoot).not.toBeVisible()

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// Application Status Stepper (P3)
// ============================================================
describe("Application Status Stepper", () => {
  test(
    "renders stepper for in-review application",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/applications/${MOCK_APPLICATION.id}`)
      await page.waitForLoadState("networkidle")

      await pwExpect(page.getByText("Submitted").first()).toBeVisible({
        timeout: 10000,
      })
      await pwExpect(page.getByText("In Review").first()).toBeVisible()
      await pwExpect(page.getByText("Accepted").first()).toBeVisible()

      const stepCircles = page.locator(".rounded-full.border-2")
      expect(await stepCircles.count()).toBe(3)

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// ARIA Labels (P3)
// ============================================================
describe("ARIA Labels", () => {
  test(
    "payment actions button has aria-label",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/payments`)
      await page.waitForLoadState("networkidle")

      const btn = page.locator('[aria-label="Payment actions"]')
      await pwExpect(btn.first()).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "form page back button has aria-label",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/popups/new`)
      await page.waitForLoadState("networkidle")

      const btn = page.locator('[aria-label="Go back"]')
      await pwExpect(btn).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )

  test(
    "application actions button has aria-label",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/applications`)
      await page.waitForLoadState("networkidle")

      const btn = page.locator('[aria-label="Application actions"]')
      await pwExpect(btn.first()).toBeVisible({ timeout: 10000 })

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// Responsive Tables (P2)
// ============================================================
describe("Responsive Tables", () => {
  test(
    "hides columns on mobile viewport",
    async () => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
      })
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
        if (url.includes("/users/me")) return route.fulfill({ json: MOCK_USER })
        if (url.includes("/payments")) {
          return route.fulfill({
            json: {
              results: [
                {
                  id: "pay-001",
                  amount: 100,
                  currency: "USD",
                  status: "pending",
                  source: "stripe",
                  coupon_code: "CODE",
                  checkout_url: null,
                  external_id: null,
                  rate: null,
                  discount_value: null,
                  products_snapshot: [],
                  created_at: "2025-01-01T00:00:00Z",
                  updated_at: null,
                },
              ],
              paging: { limit: 100, offset: 0, total: 1 },
            },
          })
        }
        if (url.includes("/pending-reviews"))
          return route.fulfill({ json: EMPTY_LIST })
        if (url.includes("/popups") && !url.includes("/popups/")) {
          return route.fulfill({
            json: {
              results: [MOCK_POPUP],
              paging: { limit: 100, offset: 0, total: 1 },
            },
          })
        }
        return route.fulfill({ json: EMPTY_LIST })
      })

      await page.goto(`${BASE_URL}/payments`)
      await page.waitForLoadState("networkidle")

      const table = page.locator("table")
      await pwExpect(table).toBeVisible({ timeout: 10000 })

      const sourceHeader = table.locator('th:has-text("Source")')
      expect(await sourceHeader.count()).toBe(0)

      await context.close()
    },
    TEST_TIMEOUT,
  )
})

// ============================================================
// Form Error Summary (P3)
// ============================================================
describe("Form Error Summary", () => {
  test(
    "shows error summary on submit with empty required fields",
    async () => {
      const page = await createAuthedPage()
      await page.goto(`${BASE_URL}/popups/${MOCK_POPUP.id}/edit`)
      await page.waitForSelector('input[id="name"]', { timeout: 10000 })

      const nameInput = page.locator('input[id="name"]')
      await nameInput.clear()
      await nameInput.blur()

      await page.locator('button[type="submit"]').first().click()

      const errorSummary = page.locator('[role="alert"]')
      await pwExpect(errorSummary).toBeVisible({ timeout: 5000 })
      await pwExpect(errorSummary.getByText(/error/i)).toBeVisible()

      await page.context().close()
    },
    TEST_TIMEOUT,
  )
})
