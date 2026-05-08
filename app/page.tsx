"use client";

import BackgroundCanvas from "@/components/homepage/BackgroundCanvas";
import StickyHeader from "@/components/global/StickyHeader/StickyHeader";
import Hero from "@/components/homepage/Hero/Hero";
import FeaturedItems from "@/components/homepage/FeaturedItems/FeaturedItems";
import BurgerChallengeTeaser from "@/components/homepage/BurgerChallengeTeaser/BurgerChallengeTeaser";
import { useEffect } from "react";

export default function Page() {
  // prevents the browser from restoring scroll position
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <>
      <BackgroundCanvas />
      <StickyHeader />
      <Hero />
      <FeaturedItems />
      <BurgerChallengeTeaser />
    </>
  );
}