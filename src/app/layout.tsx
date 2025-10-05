import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FileCraft Pro - Modern File Conversion & Processing",
  description: "Transform your files with lightning speed. The ultimate toolkit for developers, creators, and professionals. Convert images, videos, audio, encode text, and more.",
  keywords: "file conversion, image converter, video converter, audio converter, text encoder, hash generator, file compression",
  authors: [{ name: "FileCraft Pro" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
