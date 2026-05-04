"use client";

import BackgroundCanvas from "@/components/homepage/BackgroundCanvas";
import StickyHeader from "@/components/global/StickyHeader/StickyHeader";
import Hero from "@/components/homepage/Hero/Hero";
import BurgerChallengeTeaser from "@/components/homepage/BurgerChallengeTeaser/BurgerChallengeTeaser";

export default function Page() {
  return (
    <>
      <BackgroundCanvas />
      <StickyHeader />
      <Hero />
      <BurgerChallengeTeaser />
    </>
  );
}