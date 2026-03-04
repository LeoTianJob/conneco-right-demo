import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative rounded-2xl border border-border bg-card px-8 py-16 md:px-16">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/[0.03]" />

          <h2 className="relative text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Ready to protect your creative work?
          </h2>
          <p className="relative mt-4 text-pretty text-muted-foreground">
            Join thousands of artists and institutions who trust ArtVault to
            manage and safeguard their most valuable assets.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Schedule a demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
