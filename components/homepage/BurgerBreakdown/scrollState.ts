// Written by ScrollTracker, read by BurgerGroup and IngredientMesh in useFrame.
// Plain object — no React, no re-renders.

const scrollState = {
  zone: "hero" as "hero" | "breakdown" | "other",
  breakdownProgress: 0, // 0 → 1 as user scrolls through the breakdown section
};

export default scrollState;