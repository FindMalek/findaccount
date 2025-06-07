import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { notFoundMetadata } from "@/config/site"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = notFoundMetadata()

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-8 h-64 w-64 relative">
          <Image
            src="/not-found.png"
            alt="Page not found"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Page Not Found
        </h2>
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
          been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 