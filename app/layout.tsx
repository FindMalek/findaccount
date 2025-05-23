import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"

import { fonts } from "@/config/fonts"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

import { Analytics } from "@/components/layout/analytics"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"
import { TailwindIndicator } from "@/components/layout/tailwind-indicator"
import { Toaster } from "@/components/ui/sonner"

interface RootLayoutProps {
  children: React.ReactNode
}

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "findmalek",
      url: "https://www.findmalek.com",
    },
  ],
  creator: "findmalek",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.images.default, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.images.default],
    creator: "@findmalek",
  },
  icons: {
    icon: "/favicons/favicon.ico",
    shortcut: "/favicons/favicon-16x16.png",
    apple: "/favicons/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
  metadataBase: new URL(siteConfig.url),
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fonts
        )}
      >
        <LayoutWrapper>
          {children}
          <Analytics />
          <Toaster />
          <TailwindIndicator />
        </LayoutWrapper>
      </body>
    </html>
  )
}
