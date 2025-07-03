import { Metadata } from "next"
import Link from "next/link"

import { siteConfig } from "@/config/site"

import { AuthLoginForm } from "@/components/app/auth-login-form"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Button
        variant="secondary"
        className="absolute left-4 top-4 md:left-8 md:top-8"
        asChild
      >
        <Link href="/">
          <Icons.chevronLeft className="size-4 transition-all duration-300 hover:pr-2" />
          <span>Back</span>
        </Link>
      </Button>
      <div className="w-full max-w-sm">
        <div className="mb-4 flex flex-col items-center gap-2">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <div className="flex size-8 items-center justify-center rounded-md">
              <Icons.logo className="size-6" />
            </div>
            <span className="sr-only">{siteConfig.name}</span>
          </Link>
          <h1 className="text-xl font-bold">Welcome to {siteConfig.name}</h1>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="hover:text-primary underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </div>

        <AuthLoginForm />
      </div>
    </div>
  )
}
