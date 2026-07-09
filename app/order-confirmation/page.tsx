"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const OrderConfirmationPage = dynamic(
  () => import("@/components/order-confirmation/OrderConfirmationPage/OrderConfirmationPage"),
  { ssr: false }
);

export default function OrderConfirmation() {
  return (
    <Suspense>
      <OrderConfirmationPage />
    </Suspense>
  );
}