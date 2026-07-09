import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BurgerIngredients } from "./burgerUtils";

// ── Cart item shape ─────────────────────────────────────────
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  ingredients?: BurgerIngredients | null;
  maxQuantity?: number; // ── limits how many can be ordered (e.g. 1 for BOTD)
}

// ── Flying animation coordinates ────────────────────────────
// When an item is added, the button's screen position is stored
// here so the FlyingItem component knows where to start from.
interface FlyFromCoords {
  x: number;
  y: number;
}

// ── Store interface ─────────────────────────────────────────
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  flyFrom: FlyFromCoords | null;
  wobble: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setFlyFrom: (coords: FlyFromCoords | null) => void;
  setWobble: (val: boolean) => void;
}

// ── Store ───────────────────────────────────────────────────
const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      // ── State ──
      items: [],
      isOpen: false,
      flyFrom: null,
      wobble: false,

      // ── Add an item ──
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }

          return { items: [...state.items, item] };
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
            return { items: state.items.filter((i) => i.id !== id) };
          }

          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i,
            ),
          };
        }),

      // ── Empty the whole cart ──
      clearCart: () => set({ items: [] }),

      // ── Open or close the cart drawer ──
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // ── Set the starting position for the flying animation ──
      setFlyFrom: (coords) => set({ flyFrom: coords }),

      // ── Trigger or reset the bag icon wobble ──
      setWobble: (val) => set({ wobble: val }),
    }),
    {
      // ── localStorage key ──
      name: "smashd-cart",

      // ── Only persist the items array ──
      // Everything else resets on page load
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export default useCartStore;
