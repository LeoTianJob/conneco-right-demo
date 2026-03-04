"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, LogOut, Save, User } from "lucide-react";

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isLoaded && !user) {
            router.replace("/sign-in");
        }
        if (user) {
            setFirstName(user.firstName ?? "");
            setLastName(user.lastName ?? "");
        }
    }, [isLoaded, user, router]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await user.update({ firstName, lastName });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.replace("/");
    };

    if (!isLoaded || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    const initials = [user.firstName, user.lastName]
        .filter(Boolean)
        .map((n) => n![0].toUpperCase())
        .join("") || user.emailAddresses[0]?.emailAddress[0].toUpperCase() || "?";

    const joinedDate = new Date(user.createdAt!).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="mx-auto max-w-2xl">

                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                {/* Profile Card Header */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm mb-6">
                    <div className="flex items-center gap-5">
                        {user.imageUrl ? (
                            <Image
                                src={user.imageUrl}
                                alt="Profile"
                                width={80}
                                height={80}
                                className="h-20 w-20 rounded-full object-cover border border-border"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                                {initials}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                {user.fullName || "Your Profile"}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {user.primaryEmailAddress?.emailAddress}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Member since {joinedDate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Editable Info */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm mb-6">
                    <div className="mb-6 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                            Personal Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground"
                                placeholder="First name"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:ring-1 focus:ring-foreground"
                                placeholder="Last name"
                            />
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={user.primaryEmailAddress?.emailAddress ?? ""}
                            disabled
                            className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed"
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            Email cannot be changed here. Manage it through your account settings.
                        </p>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Sign Out */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Account
                    </h2>
                    <p className="mb-5 text-sm text-muted-foreground">
                        Sign out of your Conneco Right account on this device.
                    </p>
                    <button
                        onClick={handleSignOut}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>

            </div>
        </div>
    );
}
