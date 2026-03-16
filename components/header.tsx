"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Show, useUser } from "@clerk/nextjs";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();

  const hiddenRoutes = ["/profile", "/dashboard", "/admin"];
  const isHidden = hiddenRoutes.some(route => pathname?.startsWith(route));

  const headerItems: string[] = ["Features", "Creators", "Pricing", "Our Story", "Contact"];

  const initials = user
    ? ([user.firstName, user.lastName].filter(Boolean).map((n) => n![0].toUpperCase()).join("") ||
      user.emailAddresses[0]?.emailAddress[0].toUpperCase() ||
      "?")
    : "?";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isHidden) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border"
        : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo height={28} showText className="text-lg font-semibold [&>span]:text-lg" />

        <nav className="hidden items-center gap-8 md:flex">
          {headerItems.map((item) => {
            // Here is how you can use if/else logic inside the map!
            // Example: "About" goes to the /about page, others go to the homepage sections
            let href = `/#${item.toLowerCase()}`;
            if (item === "Our Story") {
              href = "/about";
            }

            return (
              <Link
                key={item}
                href={href}
                className="group relative py-2 text-sm font-medium tracking-widest uppercase text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Show when="signed-out">
            <Link href="/sign-in" className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer inline-block">
              Sign In
            </Link>
            <Link href="/sign-up" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer inline-block">
              Sign Up
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full overflow-hidden border border-border hover:ring-2 hover:ring-offset-1 hover:ring-foreground transition-all"
              title="View profile"
            >
              {user?.imageUrl ? (
                <Image src={user.imageUrl} alt="Profile" width={36} height={36} className="h-full w-full object-cover" />
              ) : (
                <span className="bg-primary text-primary-foreground text-sm font-semibold h-full w-full flex items-center justify-center">
                  {initials}
                </span>
              )}
            </Link>
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
            {headerItems.map((item) => {
              // Same if/else logic for the mobile menu
              let href = `/#${item.toLowerCase()}`;
              if (item === "Our Story") {
                href = "/about";
              }

              return (
                <Link
                  key={item}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium tracking-widest uppercase text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:pl-5"
                >
                  {item}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <Show when="signed-out">
                <Link href="/sign-in" className="rounded-md px-3 py-2.5 text-center text-sm text-muted-foreground transition-colors hover:text-foreground w-full cursor-pointer inline-block">
                  Sign In
                </Link>
                <Link href="/sign-up" className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground w-full cursor-pointer inline-block mt-2">
                  Sign Up
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full overflow-hidden border border-border shrink-0">
                    {user?.imageUrl ? (
                      <Image src={user.imageUrl} alt="Profile" width={28} height={28} className="h-full w-full object-cover" />
                    ) : (
                      <span className="bg-primary text-primary-foreground text-xs font-semibold h-full w-full flex items-center justify-center">
                        {initials}
                      </span>
                    )}
                  </span>
                  My Profile
                </Link>
              </Show>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
