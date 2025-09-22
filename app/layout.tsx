import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polling App - Create and Share Polls Instantly",
  description: "Build engaging polls, collect responses, and analyze results in real-time. Perfect for teams, events, and community engagement.",
  keywords: ["polls", "voting", "surveys", "engagement", "real-time"],
  authors: [{ name: "Polling App Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://polling.grandkojo.my",
    siteName: "Polling App",
    title: "Polling App - Create and Share Polls Instantly",
    description: "Build engaging polls, collect responses, and analyze results in real-time. Perfect for teams, events, and community engagement.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Polling App - Create and Share Polls",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@grandkojo", 
    creator: "@grandkojo", 
    title: "Polling App - Create and Share Polls Instantly",
    description: "Build engaging polls, collect responses, and analyze results in real-time. Perfect for teams, events, and community engagement.",
    images: ["/og-image.png"], // Replace with your custom image
  },
  metadataBase: new URL("https://polling.grandkojo.my"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
