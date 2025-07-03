import type { Metadata } from "next"
import Link from "next/link"

import { notFoundMetadata } from "@/config/site"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = notFoundMetadata()

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-foreground mb-4 text-6xl font-bold">404</h1>
        <h2 className="text-foreground mb-4 text-2xl font-semibold">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved, deleted, or you entered the wrong URL.
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
