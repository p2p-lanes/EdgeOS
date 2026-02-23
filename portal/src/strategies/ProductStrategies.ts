import {
  getPriceStrategy,
  type PriceStrategy,
} from "@/strategies/PriceStrategy"
import type { AttendeePassState } from "@/types/Attendee"
import type { DiscountProps } from "@/types/discounts"
import type { ProductsPass } from "@/types/Products"

interface ProductStrategy {
  handleSelection: (
    attendees: AttendeePassState[],
    attendeeId: string,
    product: ProductsPass,
    discount?: DiscountProps,
  ) => AttendeePassState[]
}

class ExclusiveProductStrategy implements ProductStrategy {
  handleSelection(
    attendees: AttendeePassState[],
    attendeeId: string,
    product: ProductsPass,
  ): AttendeePassState[] {
    return attendees.map((attendee) => {
      if (attendee.id !== attendeeId) return attendee

      const willBeSelected = !product?.selected

      return {
        ...attendee,
        products: attendee.products.map((p) => ({
          ...p,
          selected:
            p.id === product.id
              ? !p.selected
              : p.exclusive && willBeSelected && product?.exclusive
                ? false
                : p.selected,
        })),
      }
    })
  }
}

class PatreonProductStrategy implements ProductStrategy {
  private priceStrategy: PriceStrategy

  constructor() {
    this.priceStrategy = getPriceStrategy()
  }

  handleSelection(
    attendees: AttendeePassState[],
    attendeeId: string,
    product: ProductsPass,
    discount?: DiscountProps,
  ): AttendeePassState[] {
    const isPatreonSelected = !product?.selected

    return attendees.map((attendee) => {
      if (attendee.id !== attendeeId) return attendee

      return {
        ...attendee,
        products: attendee.products.map((p) => ({
          ...p,
          selected:
            attendee.id === attendeeId && p.id === product.id
              ? !p.selected
              : p.selected,
          price: this.priceStrategy.calculatePrice(
            p,
            isPatreonSelected || false,
            discount?.discount_value || 0,
          ),
        })),
      }
    })
  }
}

class MonthProductStrategy implements ProductStrategy {
  handleSelection(
    attendees: AttendeePassState[],
    attendeeId: string,
    product: ProductsPass,
  ): AttendeePassState[] {
    const isMonthSelected = product?.selected
    const willSelectMonth = !isMonthSelected

    return attendees.map((attendee) => {
      if (attendee.id !== attendeeId) return attendee

      return {
        ...attendee,
        products: attendee.products.map((p) => ({
          ...p,
          selected:
            p.id === product.id
              ? !p.selected
              : p.category === "week" && !p.purchased
                ? willSelectMonth
                : p.selected,
        })),
      }
    })
  }
}

class WeekProductStrategy implements ProductStrategy {
  protected countActiveWeeks(products: ProductsPass[]): number {
    return products.filter(
      (p) => p.category === "week" && (p.purchased || p.selected),
    ).length
  }

  protected hasEditedWeeks(products: ProductsPass[]): boolean {
    return products.some((p) => p.category === "week" && p.edit)
  }

  protected shouldSelectMonth(
    activeWeeks: number,
    hasEditedWeeks: boolean,
    monthPurchased: boolean,
  ): boolean {
    if (monthPurchased) {
      return false
    }
    return activeWeeks >= 4 && !hasEditedWeeks
  }

  handleSelection(
    attendees: AttendeePassState[],
    attendeeId: string,
    product: ProductsPass,
  ): AttendeePassState[] {
    return attendees.map((attendee) => {
      if (attendee.id !== attendeeId) return attendee

      const willBeSelected = !product.selected
      const monthProduct = attendee.products.find((p) => p.category === "month")

      const updatedProducts = attendee.products.map((p) => ({
        ...p,
        selected: p.id === product.id ? willBeSelected : p.selected,
        edit:
          p.id === product.id ? product.purchased && willBeSelected : p.edit,
      }))

      const activeWeeks = this.countActiveWeeks(updatedProducts)
      const hasEdited = this.hasEditedWeeks(updatedProducts)
      const shouldSelectMonth = this.shouldSelectMonth(
        activeWeeks,
        hasEdited,
        monthProduct?.purchased || false,
      )

      return {
        ...attendee,
        products: updatedProducts.map((p) => ({
          ...p,
          quantity:
            p.category.includes("day") && shouldSelectMonth && !p.purchased
              ? 0
              : p.quantity,
          selected:
            p.category === "month"
              ? shouldSelectMonth
              : p.category.includes("day") && shouldSelectMonth
                ? false
                : p.selected,
          edit: p.category === "month" ? hasEdited : p.edit,
        })),
      }
    })
  }
}

class LocalMonthProductStrategy implements ProductStrategy {
  handleSelection(
    attendees: AttendeePassState[],
    attendeeId: string,
    product: ProductsPass,
  ): AttendeePassState[] {
    const isMonthSelected = product?.selected
    const willSelectMonth = !isMonthSelected

    return attendees.map((attendee) => {
      if (attendee.id !== attendeeId) return attendee

      return {
        ...attendee,
        products: attendee.products.map((p) => ({
          ...p,
          selected:
            p.id === product.id
              ? !p.selected
              : p.category === "local week" && !p.purchased
                ? willSelectMonth
                : p.selected,
        })),
      }
    })
  }
}

class LocalWeekProductStrategy implements ProductStrategy {
  protected countActiveWeeks(products: ProductsPass[]): number {
    return products.filter(
      (p) => p.category === "local week" && (p.purchased || p.selected),
    ).length
  }

  protected hasEditedWeeks(products: ProductsPass[]): boolean {
    return products.some((p) => p.category === "local week" && p.edit)
  }

  protected shouldSelectMonth(
    activeWeeks: number,
    hasEditedWeeks: boolean,
    monthPurchased: boolean,
  ): boolean {
    if (monthPurchased) {
      return false
    }
    return activeWeeks >= 4 && !hasEditedWeeks
  }

  handleSelection(
    attendees: AttendeePassState[],
    attendeeId: string,
    product: ProductsPass,
  ): AttendeePassState[] {
    return attendees.map((attendee) => {
      if (attendee.id !== attendeeId) return attendee

      const willBeSelected = !product.selected
      const monthProduct = attendee.products.find(
        (p) => p.category === "local month",
      )

      const updatedProducts = attendee.products.map((p) => ({
        ...p,
        selected: p.id === product.id ? willBeSelected : p.selected,
        edit:
          p.id === product.id ? product.purchased && willBeSelected : p.edit,
      }))

      const activeWeeks = this.countActiveWeeks(updatedProducts)
      const hasEdited = this.hasEditedWeeks(updatedProducts)
      const shouldSelectMonth = this.shouldSelectMonth(
        activeWeeks,
        hasEdited,
        monthProduct?.purchased || false,
      )

      return {
        ...attendee,
        products: updatedProducts.map((p) => ({
          ...p,
          quantity:
            p.category.includes("day") && shouldSelectMonth && !p.purchased
              ? 0
              : p.quantity,
          selected:
            p.category === "local month"
              ? shouldSelectMonth
              : p.category.includes("day") && shouldSelectMonth
                ? false
                : p.selected,
          edit: p.category === "local month" ? hasEdited : p.edit,
        })),
      }
    })
  }
}

class DayProductStrategy implements ProductStrategy {
  handleSelection(
    attendees: AttendeePassState[],
    attendeeId: string,
    product: ProductsPass,
  ): AttendeePassState[] {
    return attendees.map((attendee) => {
      if (attendee.id !== attendeeId) return attendee

      return {
        ...attendee,
        products: attendee.products.map((p) => ({
          ...p,
          selected:
            p.id === product.id
              ? !!(
                  product.quantity &&
                  product.quantity - (p.original_quantity ?? 0) > 0
                )
              : p.selected,
          quantity: p.id === product.id ? product.quantity : p.quantity,
        })),
      }
    })
  }
}

export const getProductStrategy = (
  product: ProductsPass,
  _isEditing: boolean,
): ProductStrategy => {
  if (product.exclusive && product.category !== "month")
    return new ExclusiveProductStrategy()

  switch (product.category) {
    case "patreon":
      return new PatreonProductStrategy()
    case "month":
      return new MonthProductStrategy()
    case "local month":
      return new LocalMonthProductStrategy()
    case "week":
      return new WeekProductStrategy()
    case "local week":
      return new LocalWeekProductStrategy()
    case "exclusive":
      return new ExclusiveProductStrategy()
    case "day":
      return new DayProductStrategy()
    case "local day":
      return new DayProductStrategy()
    default:
      return new WeekProductStrategy()
  }
}
