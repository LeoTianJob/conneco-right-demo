import Link from "next/link";
import {
    Hexagon,
    Heart,
    Globe,
    Zap,
    Users,
    Award,
    ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About – ArtVault",
    description:
        "Learn about the team and mission behind ArtVault, the creative asset management platform built to protect and amplify the work of artists worldwide.",
};

const values = [
    {
        icon: Heart,
        title: "Artist-first",
        description:
            "Every decision we make starts with one question: does this make things better for the artists who use us? Not shareholders, not algorithms — artists.",
    },
    {
        icon: Globe,
        title: "Open access",
        description:
            "Great art belongs to the world. We build tools that make it easier to share, license, and distribute creative work without sacrificing ownership.",
    },
    {
        icon: Zap,
        title: "Relentless craft",
        description:
            "We hold our software to the same standard artists hold their work — refined, intentional, and without unnecessary clutter.",
    },
];

const team = [
    {
        name: "Mia Tanaka",
        role: "Co-founder & CEO",
        bio: "Former curator at MoMA. Built her first digital archive at 16. Obsessed with the intersection of art and infrastructure.",
        initials: "MT",
    },
    {
        name: "James Okoye",
        role: "Co-founder & CTO",
        bio: "Previously led distributed systems at Cloudflare. Believes the best technology is the kind you never have to think about.",
        initials: "JO",
    },
    {
        name: "Sofia Reyes",
        role: "Head of Design",
        bio: "Graphic designer turned product designer. Has a soft spot for type-driven layouts and obsessing over 1-pixel margins.",
        initials: "SR",
    },
    {
        name: "Ethan Park",
        role: "Head of Partnerships",
        bio: "Built institutional programs at Sotheby's and Christie's before pivoting to SaaS. Knows every major gallery director by name.",
        initials: "EP",
    },
];

const milestones = [
    { year: "2021", event: "Company founded in a Brooklyn studio apartment." },
    { year: "2022", event: "Raised $4M seed round. Launched private beta." },
    {
        year: "2023",
        event: "10,000 artists onboarded. First institutional partnership signed.",
    },
    {
        year: "2024",
        event: "Launched blockchain provenance layer. Series A closed at $22M.",
    },
    {
        year: "2025",
        event: "50,000+ artists, 12M+ assets protected across 80 countries.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main>
                {/* ── Hero ── */}
                <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-40 text-center">
                    {/* Glow */}
                    <div className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

                    <div className="relative z-10 mx-auto max-w-3xl">
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs text-muted-foreground">
                            <Hexagon className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                            Our story
                        </div>

                        <h1 className="text-balance text-5xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-6xl">
                            Building the infrastructure
                            <br />
                            creative work deserves
                        </h1>

                        <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                            ArtVault was born from frustration. Mia lost three years of digital
                            work when a hard drive failed. James kept hearing the same story
                            from artists everywhere. So we built what should have existed all
                            along.
                        </p>
                    </div>
                </section>

                {/* ── Mission ── */}
                <section className="px-6 py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-8 rounded-2xl border border-border bg-card p-10 md:grid-cols-2 md:gap-16 md:p-16">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                                    Mission
                                </p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                    Art shouldn&apos;t be fragile.
                                </h2>
                            </div>
                            <div className="flex flex-col justify-center gap-4 text-muted-foreground">
                                <p className="leading-relaxed">
                                    Independent artists, photographers, illustrators, and
                                    musicians lose their life&apos;s work every year to failed drives,
                                    stolen files, and uncredited copies. Meanwhile, institutions
                                    that should be preserving culture are drowning in spreadsheets.
                                </p>
                                <p className="leading-relaxed">
                                    We exist to change that — with software built specifically for
                                    creative people, not repurposed enterprise tools. ArtVault
                                    gives every artist, from a bedroom illustrator to a major
                                    museum, the same level of protection that the world&apos;s most
                                    valuable collections have always had.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Values ── */}
                <section className="px-6 py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-medium uppercase tracking-wide text-primary">
                                Values
                            </p>
                            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                What we believe
                            </h2>
                        </div>

                        <div className="mt-12 grid gap-4 md:grid-cols-3">
                            {values.map((v) => (
                                <div
                                    key={v.title}
                                    className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-secondary"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary/10">
                                        <v.icon className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="mt-4 text-base font-medium text-foreground">
                                        {v.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {v.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Team ── */}
                <section className="px-6 py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-medium uppercase tracking-wide text-primary">
                                Team
                            </p>
                            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                The people behind ArtVault
                            </h2>
                            <p className="mt-4 text-pretty text-muted-foreground">
                                A small team of builders, curators, and designers who care
                                deeply about creative work.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {team.map((member) => (
                                <div
                                    key={member.name}
                                    className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20"
                                >
                                    {/* Avatar */}
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        {member.initials}
                                    </div>
                                    <h3 className="mt-4 text-base font-medium text-foreground">
                                        {member.name}
                                    </h3>
                                    <p className="text-xs text-primary">{member.role}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {member.bio}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Timeline ── */}
                <section className="px-6 py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-medium uppercase tracking-wide text-primary">
                                History
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                How we got here
                            </h2>
                        </div>

                        <div className="mx-auto mt-12 max-w-2xl">
                            <div className="relative space-y-0">
                                {milestones.map((m, i) => (
                                    <div key={m.year} className="flex gap-6">
                                        {/* Line + dot */}
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary">
                                                {m.year.slice(2)}
                                            </div>
                                            {i < milestones.length - 1 && (
                                                <div className="my-1 w-px flex-1 bg-border" />
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="pb-8 pt-1">
                                            <p className="text-xs font-medium text-primary">
                                                {m.year}
                                            </p>
                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                {m.event}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Stats ── */}
                <section className="px-6 py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-px rounded-2xl border border-border bg-border sm:grid-cols-3">
                            {[
                                { icon: Users, value: "50K+", label: "Artists trust us" },
                                { icon: Award, value: "12M+", label: "Assets protected" },
                                { icon: Globe, value: "80+", label: "Countries reached" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex flex-col items-center gap-2 bg-card px-6 py-12 text-center first:rounded-l-2xl last:rounded-r-2xl"
                                >
                                    <stat.icon
                                        className="h-6 w-6 text-primary"
                                        strokeWidth={1.5}
                                    />
                                    <p className="text-3xl font-semibold text-foreground md:text-4xl">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-6xl">
                        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-12 text-center md:p-20">
                            {/* Glow */}
                            <div className="pointer-events-none absolute top-0 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

                            <div className="relative z-10">
                                <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                                    Ready to protect your work?
                                </h2>
                                <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
                                    Join over 50,000 artists who trust ArtVault to keep their
                                    creative legacy safe, organised, and theirs.
                                </p>
                                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                    <Link
                                        href="#pricing"
                                        className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-border"
                                    >
                                        Back to Home
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
