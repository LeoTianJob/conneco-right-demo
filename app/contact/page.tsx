import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Contact – Conneco Right",
  description:
    "Reach the Conneco Right team for support, partnerships, and account questions including deactivated accounts.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-28 md:pt-32">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Contact
        </h1>
        <p className="mt-4 text-muted-foreground">
          For product questions, partnerships, or billing, email us and we will route your message to
          the right team. We aim to reply within two business days.
        </p>
        <p className="mt-6 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
          <span className="font-medium text-foreground">Deactivated accounts:</span> if you
          previously deactivated your account and need access again, mention that in your message
          so we can help with recovery. Self-service restore is not available yet; our team will
          assist from this page.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-accent underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
