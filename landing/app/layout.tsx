import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Rayfine - Raycast Extension for Mantle Blockchain",
    template: "%s | Rayfine",
  },
  description: "Rayfine is a Raycast extension for Mantle blockchain. Swap, stake, lend, and manage your crypto wallet directly from your Mac command bar. The fastest way to interact with Mantle DeFi.",
  keywords: [
    "Rayfine",
    "Raycast Mantle",
    "Mantle Raycast",
    "Mantle blockchain Raycast",
    "Raycast extension Mantle",
    "Raycast",
    "Mantle",
    "Mantle Network",
    "Mantle DeFi",
    "Blockchain",
    "DeFi",
    "DEX",
    "Swap",
    "Crypto Swap",
    "Staking",
    "mETH",
    "mETH Staking",
    "Lending",
    "Lendle",
    "OpenOcean",
    "Uniswap V3",
    "Merchant Moe",
    "Agni Finance",
    "Wallet",
    "Crypto Wallet",
    "Web3",
    "Mac Crypto",
    "Command Bar Crypto",
    "Pyth Oracle",
  ],
  authors: [{ name: "Rayfine" }],
  creator: "Rayfine",
  publisher: "Rayfine",
  applicationName: "Rayfine",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://rayfine.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rayfine - Raycast Extension for Mantle Blockchain",
    description: "The fastest way to interact with Mantle blockchain. Swap, stake, lend from your Mac command bar.",
    url: "https://rayfine.dev",
    siteName: "Rayfine",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/rayfine-logo.png",
        width: 500,
        height: 500,
        alt: "Rayfine Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rayfine - Raycast Extension for Mantle Blockchain",
    description: "The fastest way to interact with Mantle blockchain. Swap, stake, lend from your Mac command bar.",
    images: ["/rayfine-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
}

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rayfine",
  applicationCategory: "FinanceApplication",
  operatingSystem: "macOS",
  description: "Raycast extension for interacting with the Mantle blockchain directly from your command bar. Swap, stake, lend, and manage your wallet in seconds.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "10",
  },
  keywords: "Rayfine, Raycast Mantle, Mantle Raycast, Mantle blockchain, DeFi, crypto wallet, swap, staking, lending",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <div className="noise-overlay" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
