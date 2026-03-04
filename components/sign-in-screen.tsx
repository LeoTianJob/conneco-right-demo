"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const quotes = [
  {
    text: "Creativity is intelligence having fun.",
    author: "Albert Einstein",
  },
  {
    text: "Every artist was first an amateur.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "Art is not what you see, but what you make others see.",
    author: "Edgar Degas",
  },
];

function QuoteCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-full overflow-hidden">
        {quotes.map((q, i) => (
          <div
            key={i}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ease-in-out"
            style={{
              opacity: i === index ? 1 : 0,
              transform: i === index ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <p className="font-serif text-3xl leading-snug tracking-tight text-foreground lg:text-4xl">
              {`\u201C${q.text}\u201D`}
            </p>
            <span className="mt-4 text-sm tracking-widest uppercase text-muted-foreground">
              {"— "}{q.author}
            </span>
          </div>
        ))}
      </div>
      {/* Active dot indicators */}
      <div className="mt-10 flex gap-2">
        {quotes.map((_, i) => (
          <span
            key={i}
            className={`inline-block size-1.5 rounded-full transition-colors duration-500 ${
              i === index ? "bg-accent" : "bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function SignInScreen() {
  const [tab, setTab] = useState<"personal" | "institution">("personal");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* ── Left: Auth Form (40%) ── */}
      <div className="flex w-full flex-col justify-between bg-background px-8 py-10 md:w-[40%] md:px-12">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          Conneco<span className="text-accent">Right</span>
        </Link>

        {/* Form */}
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access your creative vault.
          </p>

          {/* Tabs */}
          <div className="mt-6 flex rounded-lg border border-border bg-muted p-1">
            {(["personal", "institution"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "personal" ? "Personal" : "Institution (School)"}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder={tab === "institution" ? "School email address" : "Email address"}
                className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div className="flex items-center justify-end">
              <Link href="#" className="text-xs font-medium text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3">
            {[
              { label: "Google", icon: GoogleIcon },
              { label: "Apple", icon: AppleIcon },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {"Don\u2019t have an account? "}
            <Link href="/sign-up" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          {"© 2026 ConnecoRight. All rights reserved."}
        </p>
      </div>

      {/* ── Right: Editorial (60%) ── */}
      <div className="hidden w-[60%] flex-col items-center justify-center bg-secondary md:flex">
        <QuoteCarousel />
      </div>
    </div>
  );
}

/* ── Inline SVG Icons ── */

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
