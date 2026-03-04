import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Now available for early access
        </div>

        {/* Headline */}
        <h1 className="text-balance text-5xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-7xl">
          Secure Your
          <br />
          Creative Legacy
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          The all-in-one platform for managing, protecting, and showcasing your
          creative assets. Built for artists and institutions.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="#pricing"
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-border"
          >
            <Play className="h-4 w-4 text-muted-foreground" />
            Watch Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border pt-8 md:gap-16">
          {[
            { value: "50K+", label: "Artists Onboarded" },
            { value: "12M+", label: "Assets Protected" },
            { value: "99.99%", label: "Uptime SLA" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-semibold text-foreground md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative z-10 mx-auto mt-16 w-full max-w-5xl">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
          <Image
            src="/images/hero-art.jpg"
            alt="ArtVault digital asset management dashboard showcasing creative assets"
            width={1200}
            height={675}
            className="w-full object-cover"
            priority
          />
        </div>
        {/* Reflection glow */}
        <div className="pointer-events-none absolute -bottom-8 left-1/2 h-32 w-3/4 -translate-x-1/2 bg-primary/10 blur-3xl" />
      </div>
    </section>
  );
}
