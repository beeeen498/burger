"use client";

import { useRef } from "react";
import BurgerCanvas from "@/components/homepage/BurgerBreakdown/BurgerCanvas";
import ScrollTracker from "@/components/homepage/BurgerBreakdown/ScrollTracker";
import Hero from "@/components/homepage/Hero/Hero";
import BurgerBreakdown from "@/components/homepage/BurgerBreakdown/BurgerBreakdown";

export default function Page() {
  const heroRef      = useRef<HTMLElement>(null);
  const breakdownRef = useRef<HTMLElement>(null);

  return (
    <>
      {/* Fixed burger canvas — sits above everything, clicks pass through */}
      <BurgerCanvas />

      {/* Watches scroll position and updates scrollState */}
      <ScrollTracker heroRef={heroRef} breakdownRef={breakdownRef} />

      {/* Normal page content scrolls underneath the canvas */}
      <Hero ref={heroRef} />
      <BurgerBreakdown ref={breakdownRef} />
    </>
  );
}