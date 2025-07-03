import { Icons } from "@/components/shared/icons"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function MarketingFeatures() {
  return (
    <section className="w-full px-4 py-16 sm:py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
            Why Choose Zero-Locker?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-lg text-base sm:max-w-2xl sm:text-lg">
            Built with security, privacy, and user experience in mind.
            Everything you need to protect your digital identity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.shield className="text-primary size-5" />
                <CardTitle>Military-Grade Encryption</CardTitle>
              </div>
              <CardDescription>
                Your data is protected with AES-256 encryption, the same
                standard used by governments and financial institutions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.globe className="text-primary size-5" />
                <CardTitle>100% Open Source</CardTitle>
              </div>
              <CardDescription>
                Full transparency with publicly available code. Audit,
                contribute, and trust in a community-driven solution.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.zap className="text-primary size-5" />
                <CardTitle>Lightning Fast</CardTitle>
              </div>
              <CardDescription>
                Built with modern web technologies for instant access to your
                passwords and data across all devices.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.key className="text-primary size-5" />
                <CardTitle>Password Management</CardTitle>
              </div>
              <CardDescription>
                Generate strong passwords, store credentials securely, and
                autofill login forms with ease.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.creditCard className="text-primary size-5" />
                <CardTitle>Secure Card Storage</CardTitle>
              </div>
              <CardDescription>
                Safely store credit cards, bank details, and payment information
                with encrypted card data protection.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.lock className="text-primary size-5" />
                <CardTitle>Secret Management</CardTitle>
              </div>
              <CardDescription>
                Securely store API keys, environment variables, and sensitive
                configuration data with encrypted access control.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  )
}
