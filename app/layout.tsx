import type { Metadata } from "next";
import { Righteous, Inter } from "next/font/google";
import { Toaster } from "sonner";
import StickyHeader from "@/components/global/StickyHeader/StickyHeader";
import CartDrawer from "@/components/global/CartDrawer/CartDrawer";
import FlyingItem from "@/components/global/FlyingItem/FlyingItem";
import Footer from "@/components/global/Footer/Footer";
import LoadingScreen from "@/components/global/LoadingScreen/LoadingScreen";
import WhisperPopup from "@/components/global/WhisperPopup/WhisperPopup";
import DevShortcut from "@/components/global/DevShortcut/DevShortcut";

import "./globals.scss";

export const metadata: Metadata = {
  title: "Burgers",
  description: "Burgers restaurant",
};

const righteous = Righteous({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--header-font",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--body-font",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#df2c8b" />
      </head>
      
      <body className={`${righteous.variable} ${inter.variable}`}>
        {/* loading screen sits on top of everything until page is ready */}
        <LoadingScreen />
        <StickyHeader />
        <CartDrawer />
        {/* flying burger emoji — animates from button to bag icon */}
        <FlyingItem />
        <WhisperPopup />
        <DevShortcut />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--black)",
              color: "var(--yellow)",
              border: "3px solid var(--black)",
              fontWeight: 700,
              borderRadius: "8px",
              boxShadow: "4px 4px 0 var(--pink)",
            },
          }}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
