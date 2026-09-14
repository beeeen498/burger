"use client";

import { useEffect, Suspense } from "react";
import BackgroundCanvas from "@/components/global/BackgroundCanvas/BackgroundCanvas";
import StickyHeader from "@/components/global/StickyHeader/StickyHeader";
import Hero from "@/components/homepage/Hero/Hero";
import FeaturedItems from "@/components/homepage/FeaturedItems/FeaturedItems";
import BurgerChallengeTeaser from "@/components/homepage/BurgerChallengeTeaser/BurgerChallengeTeaser";
import Contact from "@/components/homepage/Contact/Contact";

export default function Page() {
  // prevents the browser from restoring scroll position
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // add this inside your Page component, after the existing useEffect
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      // small delay to let the page render
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <BackgroundCanvas />
      <StickyHeader />
      <Hero />
      <FeaturedItems />
      <BurgerChallengeTeaser />

      <Suspense fallback={null}>
        <Contact />
      </Suspense>
    </>
  );
}
