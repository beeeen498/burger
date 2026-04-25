import { useEffect, type RefObject } from "react";
import scrollState from "./scrollState";

interface Props {
  heroRef:      RefObject<HTMLElement>;
  breakdownRef: RefObject<HTMLElement>;
}

// Drop this once in page.tsx alongside BurgerCanvas.
// It has no UI — it just watches scroll and updates scrollState.
export default function ScrollTracker({ heroRef, breakdownRef }: Props) {
  useEffect(() => {
    const onScroll = () => {
      const hero      = heroRef.current;
      const breakdown = breakdownRef.current;
      if (!hero || !breakdown) return;

      const heroRect      = hero.getBoundingClientRect();
      const breakdownRect = breakdown.getBoundingClientRect();
      const vh            = window.innerHeight;

      // Hero is on screen
      if (heroRect.bottom > 0 && heroRect.top < vh) {
        scrollState.zone = "hero";
        scrollState.breakdownProgress = 0;
        return;
      }

      // Breakdown is on screen
      if (breakdownRect.top < vh && breakdownRect.bottom > 0) {
        scrollState.zone = "breakdown";
        const scrolled   = -breakdownRect.top;
        const scrollable = breakdown.offsetHeight - vh;
        scrollState.breakdownProgress = Math.min(Math.max(scrolled / scrollable, 0), 1);
        return;
      }

      scrollState.zone = "other";
      scrollState.breakdownProgress = 0;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroRef, breakdownRef]);

  return null;
}