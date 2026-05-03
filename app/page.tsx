"use client";

import BackgroundCanvas from "@/components/homepage/BackgroundCanvas";
import StickyHeader from "@/components/global/StickyHeader/StickyHeader";
import Hero from "@/components/homepage/Hero/Hero";
import BurgerChallenge from "@/components/homepage/BurgerChallenge/BurgerChallenge";

export default function Page() {
  return (
    <>
      <BackgroundCanvas />
      <StickyHeader />
      <Hero />
      <BurgerChallenge />
    </>
  );
}