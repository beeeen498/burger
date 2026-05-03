import type { Metadata } from "next";
import { Righteous, Inter } from "next/font/google";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Burgers",
  description: "Burgers restaurant",
};

// header font
const righteous = Righteous({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--header-font",
})

// body font
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
        {children}
      </body>
    </html>
  );
}