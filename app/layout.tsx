import type { Metadata } from "next";
import { Righteous, Inter } from "next/font/google";
import StickyHeader from "@/components/global/StickyHeader/StickyHeader";
import Footer from "@/components/global/Footer/Footer";
import LoadingScreen from "@/components/global/LoadingScreen/LoadingScreen";
import WhisperPopup from "@/components/global/WhisperPopup/WhisperPopup";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Burgers",
  description: "Burgers restaurant",
};

const righteous = Righteous({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--header-font",
})

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
      <body className={`${righteous.variable} ${inter.variable}`}>
        {/* loading screen sits on top of everything until page is ready */}
        <LoadingScreen />
        <StickyHeader />
        <WhisperPopup />
        {children}
        <Footer />

      </body>
    </html>
  );
}