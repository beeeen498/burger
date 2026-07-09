"use client";

import { Suspense } from "react";
import BuildPage from "@/components/burgerBuilder/BuildPage/BuildPage";

export default function Page() {
  return (
    <Suspense>
      <BuildPage />
    </Suspense>
  );
}