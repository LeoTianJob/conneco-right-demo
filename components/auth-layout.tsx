import { Logo } from "@/components/logo";
import { AuthQuoteCarousel } from "@/components/auth/auth-quote-carousel";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

/**
 * @description Two-column auth shell: form left, editorial quotes right. Server-rendered shell with a client quote carousel.
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-between bg-background px-8 py-10 md:w-[40%] md:px-12">
        <Logo height={28} showText className="text-lg [&>span]:text-lg" />

        <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle}
          </p>

          {children}
        </div>

        <p className="text-xs text-muted-foreground">
          {"© 2026 ConnecoRight. All rights reserved."}
        </p>
      </div>

      <div className="hidden w-[60%] flex-col items-center justify-center bg-secondary md:flex">
        <AuthQuoteCarousel />
      </div>
    </div>
  );
}
