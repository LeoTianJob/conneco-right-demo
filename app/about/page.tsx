import React from "react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16 md:px-6 md:py-20">
        <header className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Demo page · About Conneco Right
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Built to help teams ship integrations with confidence.
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            This is a demo About page for a Next.js app. It highlights your
            product story, core value props, and how Conneco Right makes it
            easier to build, test, and monitor third‑party integrations.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Opinionated, not restrictive
            </h2>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              Ship with a set of best‑practice defaults for integrations:
              retries, rate‑limit handling, observability, and more—without
              boxing your team in.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              First‑class observability
            </h2>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              Understand every call across providers in one place, with clear
              traces, structured logs, and automatic alerts when things go off
              the happy path.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Built for modern stacks
            </h2>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              Native support for serverless, background jobs, and edge
              environments so your integration layer scales with your product.
            </p>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.2fr,0.9fr] md:items-center">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100 sm:text-xl">
              Why Conneco Right?
            </h2>
            <p className="text-sm text-slate-300 sm:text-base">
              Integrations are often treated as &quot;just another API call&quot;, but
              in practice they carry your customers&apos; most critical workflows.
              Conneco Right gives your team a dedicated integration layer with
              the right primitives baked in from day one.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Standardized patterns for retries, backoff, and error handling.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Unified monitoring across every third‑party integration.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Clear boundaries between product logic and integration plumbing.</span>
              </li>
            </ul>
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-100">
              How to use this page
            </h3>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              As a demo, this page is intentionally simple. Treat it as a
              starting point: swap in your own copy, adjust the layout to match
              your brand, or extend it with live metrics, customer logos, and
              links to product docs.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Tech details: This is a server component in the Next.js App
              Router, styled with Tailwind CSS for fast iteration and good
              defaults out of the box.
            </p>
          </aside>
        </section>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400">
          <p>Conneco Right · Integration reliability that scales with you.</p>
          <div className="flex gap-3">
            <span className="rounded-full border border-slate-700 px-3 py-1">
              Next.js demo
            </span>
            <span className="rounded-full border border-slate-700 px-3 py-1">
              About page
            </span>
          </div>
        </footer>
      </section>
    </main>
  );
}

