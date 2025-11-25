import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Provider from "@/provider";
import "./globals.css";
import '@mysten/dapp-kit/dist/index.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trustless Swap - Atomic Asset Exchange on Sui",
  description: "A trustless atomic swap protocol built on Sui Move for exchanging digital assets without intermediaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider> {children} </Provider>
      </body>
    </html>
  );
}
