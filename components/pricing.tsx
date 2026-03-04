import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Pro Artist",
    price: "$19",
    period: "/mo",
    description: "For independent artists and freelance creatives.",
    features: [
      "100 GB secure storage",
      "Copyright watermarking",
      "Version history (30 days)",
      "Portfolio sharing links",
      "Basic analytics dashboard",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Education / Institution",
    price: "Custom",
    period: "",
    description:
      "For galleries, universities, and museums managing collections at scale.",
    features: [
      "Unlimited storage",
      "Centralized analytics suite",
      "Bulk student & staff accounts",
      "SSO & SAML integration",
      "Dedicated account manager",
      "Custom SLA & onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Pricing
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Start protecting your creative work today. No hidden fees, cancel
            anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-8 transition-colors ${
                plan.highlighted
                  ? "border-primary/40 bg-card shadow-lg shadow-primary/5"
                  : "border-border bg-card hover:border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-medium text-foreground">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      strokeWidth={2}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="#"
                className={`group mt-8 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-secondary text-foreground"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
