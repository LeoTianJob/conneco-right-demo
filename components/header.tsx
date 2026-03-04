"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Hexagon } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border"
        : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Hexagon className="h-7 w-7 text-primary" strokeWidth={1.5} />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ArtVault
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {["Product", "About", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {["Product", "About", "Pricing"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <Show when="signed-out">
                <SignInButton>
                  <button className="rounded-md px-3 py-2.5 text-center text-sm text-muted-foreground transition-colors hover:text-foreground w-full cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground w-full cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <div className="flex justify-center py-2.5">
                  <UserButton />
                </div>
              </Show>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
