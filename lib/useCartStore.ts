import { create } from "zustand"
import { persist } from "zustand/middleware"
import { BurgerIngredients } from "./burgerUtils"

// ── Cart item shape ─────────────────────────────────────────
// Each item in the cart has an id (from Supabase), a name,
// the price at the time of adding (includes any topping deltas),
// a quantity, and optionally the full ingredient breakdown
// for custom builds or items with topping customizations.
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  ingredients?: BurgerIngredients | null
}

// ── Store interface ─────────────────────────────────────────
interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

// ── Store ───────────────────────────────────────────────────
// persist() wraps the store so everything saves to localStorage
// automatically under the key "smashd-cart".
const useCartStore = create<CartStore>()(
  persist(
    (set) => ({

      // ── State ──
      items: [],

      // ── Add an item ──
      // If the same item id already exists, bump its quantity.
      // Otherwise push it as a new entry.
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }

          return { items: [...state.items, item] }
        }),

      // ── Remove an item by id ──
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      // ── Set a specific quantity for an item ──
      // If quantity hits 0 or below, remove the item entirely.
      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) }
          }

          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          }
        }),

      // ── Empty the whole cart ──
      clearCart: () => set({ items: [] }),
    }),
    {
      // ── localStorage key ──
      name: "smashd-cart",
    }
  )
)

export default useCartStore