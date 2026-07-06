"use client"

import useCartStore from "@/lib/useCartStore"
import styles from "./CartDrawer.module.scss"

const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, clearCart } = useCartStore()

  // ── Calculate the total price across all items ──
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // ── Don't render anything if the drawer is closed ──
  if (!isOpen) return null

  return (
    <>
      {/* ── Dark overlay behind the drawer ── */}
      <div className={styles.overlay} onClick={toggleCart} />

      {/* ── Drawer panel ── */}
      <div className={styles.drawer}>

        {/* ── Header — title + close button ── */}
        <div className={styles.header}>
          <h2 className={styles.title}>Your Bag</h2>
          <button className={styles.closeBtn} onClick={toggleCart}>
            ✕
          </button>
        </div>

        {/* ── Cart items list ── */}
        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <p className={styles.emptyMessage}>Your cart is lonely 🍔</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.cartItem}>

                {/* ── Item name and price ── */}
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* ── Quantity controls ── */}
                <div className={styles.itemActions}>
                  <div className={styles.quantity}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className={styles.qtyNum}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* ── Remove button ── */}
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer — total + clear cart ── */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalPrice}>${total.toFixed(2)}</span>
            </div>
            <button className={styles.clearBtn} onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer