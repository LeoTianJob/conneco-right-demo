"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
                            pointerEvents: i === index ? "auto" : "none",
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
                        className={`inline-block size-1.5 rounded-full transition-colors duration-500 ${i === index ? "bg-accent" : "bg-foreground/20"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const [tab, setTab] = useState<"personal" | "institution">("personal");

    return (
        <div className="flex min-h-screen">
            {/* ── Left: Auth Form (40%) ── */}
            <div className="flex w-full flex-col justify-between bg-background px-8 py-10 md:w-[40%] md:px-12">
                {/* Logo */}
                <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
                    Conneco<span className="text-accent">Right</span>
                </Link>

                {/* Form Container */}
                <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-10">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {subtitle}
                    </p>

                    {/* Tabs */}
                    <div className="mb-6 mt-6 flex rounded-lg border border-border bg-muted p-1">
                        {(["personal", "institution"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === t
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {t === "personal" ? "Personal" : "Institution (School)"}
                            </button>
                        ))}
                    </div>

                    {/* Clerk Component Injection */}
                    {children}

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
