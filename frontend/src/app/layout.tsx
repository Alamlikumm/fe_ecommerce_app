import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/Toast";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TokoKita — Belanja Online Terpercaya",
  description:
    "Platform belanja online terpercaya dengan jutaan produk berkualitas. Belanja mudah, aman, dan nyaman dengan gratis ongkir dan garansi 7 hari.",
  keywords: ["toko online", "belanja online", "ecommerce", "tokokita"],
  openGraph: {
    title: "TokoKita — Belanja Online Terpercaya",
    description: "Temukan jutaan produk berkualitas dengan harga terbaik.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${inter.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
