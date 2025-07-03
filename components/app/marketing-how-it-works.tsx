export function MarketingHowItWorks() {
  return (
    <section className="bg-muted/30 w-full px-4 py-16 sm:py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
            How It Works
          </h2>
          <p className="text-muted-foreground mx-auto max-w-lg text-base sm:max-w-2xl sm:text-lg">
            Get started with Zero-Locker in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-lg font-bold sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
              1
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
              Create Account
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Sign up with your email and create a secure master password that
              only you know.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary text-primary-foreground mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-lg font-bold sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
              2
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
              Import & Store
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Import existing passwords or add new ones. Store cards, accounts,
              and any sensitive data.
            </p>
          </div>

          <div className="text-center sm:col-span-2 md:col-span-1">
            <div className="bg-primary text-primary-foreground mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-lg font-bold sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
              3
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
              Access Anywhere
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Use Zero-Locker on all your devices with seamless sync across
              platforms.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
