"use client";

import Hero from "@/components/homepage/Hero/Hero";
import StickyHeader from "@/components/global/StickyHeader/StickyHeader";
import BackgroundCanvas from "@/components/homepage/BackgroundCanvas";

export default function Page() {
  return (
    <>
      <BackgroundCanvas />
      <StickyHeader />
      <Hero />
    </>
  );
}