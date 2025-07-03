"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { loginSchema, type LoginFormData } from "@/config/schema"
import { signIn } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"

export function AuthLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  })

  async function onSubmit(data: LoginFormData) {
    try {
      setIsLoading(true)
      const { error } = await signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => {
            setIsLoading(true)
          },
          onSuccess: () => {
            router.push("/dashboard")
          },
          onError: (ctx) => {
            toast(ctx.error.message, {
              variant: "destructive",
            })
          },
        }
      )

      if (error) {
        toast(error.message, {
          variant: "destructive",
        })
      }
    } catch (error) {
      toast("Something went wrong. Please try again.", {
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input variant="password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Remember me</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : null}
            Login
          </Button>
        </form>
      </Form>
    </div>
  )
}
