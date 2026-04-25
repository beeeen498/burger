import { forwardRef } from "react";
import styles from "./BurgerBreakdown.module.scss";

// forwardRef so page.tsx can pass breakdownRef to ScrollTracker
const BurgerBreakdown = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className={styles.section}>
      {/* Styling and content will be added later */}
    </section>
  );
});

BurgerBreakdown.displayName = "BurgerBreakdown";
export default BurgerBreakdown;