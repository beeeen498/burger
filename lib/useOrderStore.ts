import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { CartItem } from "./useCartStore"

// ── Completed order shape ───────────────────────────────────
export interface OrderData {
  supabaseOrderId: string | null
  orderNumber: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  tip: number
  discount: number
  total: number
  method: "delivery" | "pickup"
  name: string
  email: string
  address?: string
  checkoutStartedAt: number
  placedAt: number
}

// ── Store interface ─────────────────────────────────────────
interface OrderStore {
  orderData: OrderData | null
  setOrderData: (data: OrderData) => void
  clearOrderData: () => void
}

// ── Store (persisted to sessionStorage — survives refresh, clears on tab close) ──
const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orderData: null,
      setOrderData: (data) => set({ orderData: data }),
      clearOrderData: () => set({ orderData: null }),
    }),
    {
      name: "smashd-order",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export default useOrderStore