import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Science Tutor - Learn Physics, Chemistry & Biology",
  description: "Interactive AI-powered science tutor that helps students learn physics, chemistry, and biology through personalized conversations and flashcards. Get instant explanations, practice with custom flashcards, and master scientific concepts.",
  keywords: [
    "AI tutor",
    "science education",
    "physics tutor",
    "chemistry tutor", 
    "biology tutor",
    "flashcards",
    "interactive learning",
    "STEM education",
    "online tutoring",
    "science help"
  ],
  authors: [{ name: "Team Pallo AI" }],
  creator: "Team Pallo AI",
  publisher: "Team Pallo AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://ai-tutor-chat.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pallo.vercel.app/",
    title: "AI Science Tutor - Learn Physics, Chemistry & Biology",
    description: "Interactive AI-powered science tutor that helps students learn physics, chemistry, and biology through personalized conversations and flashcards.",
    siteName: "AI Science Tutor",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "AI Science Tutor - Interactive Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Science Tutor - Learn Physics, Chemistry & Biology",
    description: "Interactive AI-powered science tutor that helps students learn physics, chemistry, and biology through personalized conversations and flashcards.",
    images: ["/og-image.svg"],
    creator: "@TeamPalloAI",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#212121" },
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#3b82f6",
      },
    ],
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
