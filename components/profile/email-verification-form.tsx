"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailVerificationFormProps {
    email: string;
    onVerify: (code: string) => Promise<void>;
    onResend: () => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    error?: string | null;
}

export function EmailVerificationForm({
    email,
    onVerify,
    onResend,
    onCancel,
    isLoading,
    error: externalError,
}: EmailVerificationFormProps) {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (externalError) {
            setError(externalError);
        }
    }, [externalError]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedCode = value.slice(0, 6).split("");
            const newCode = [...code];
            pastedCode.forEach((char, i) => {
                if (i + index < 6) newCode[i + index] = char;
            });
            setCode(newCode);
            const nextIndex = Math.min(index + pastedCode.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError(null);

        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && code[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join("");
        if (verificationCode.length !== 6) {
            setError("Please enter the full 6-digit code.");
            return;
        }
        await onVerify(verificationCode);
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await onResend();
            setResendCooldown(60);
            setError(null);
        } catch (err) {
            setError("Failed to resend code. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-accent/20 bg-card p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4">
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Verify your email</h3>
                        <p className="text-sm text-muted-foreground">
                            We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={cn(
                                    "h-14 w-full rounded-lg border border-border bg-background text-center text-xl font-bold text-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40",
                                    error && "border-destructive focus:ring-destructive/20"
                                )}
                                disabled={isLoading}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isLoading || code.some((d) => d === "")}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <span>Verify & Update Email</span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending || resendCooldown > 0}
                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                        >
                            {resendCooldown > 0
                                ? `Resend code in ${resendCooldown}s`
                                : "Didn't receive a code? Resend"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
