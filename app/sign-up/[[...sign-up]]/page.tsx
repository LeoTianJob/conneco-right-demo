import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-20 px-4">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    Create your account
                </h1>
                <p className="mt-2 text-muted-foreground text-sm">
                    Join Conneco Right and protect your creative legacy.
                </p>
            </div>

            <SignUp
                appearance={{
                    elements: {
                        rootBox: "w-full mx-auto max-w-sm",
                        card: "bg-card shadow-xl border border-border rounded-xl p-8 shadow-black/5",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        logoBox: "hidden",
                        dividerLine: "bg-border",
                        dividerText: "text-muted-foreground text-xs",
                        formFieldLabel: "text-foreground font-medium",
                        formFieldInput: "bg-background border-border text-foreground rounded-md transition-colors focus:ring-ring focus:border-ring",
                        formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors font-medium border border-primary h-10 w-full",
                        socialButtonsBlockButton: "bg-card border-border text-foreground hover:bg-muted transition-colors rounded-md font-medium",
                        socialButtonsBlockButtonText: "font-medium text-foreground",
                        footerActionLink: "text-primary hover:text-primary/80 font-medium",
                        footerActionText: "text-muted-foreground",
                    },
                }}
            />
        </div>
    );
}
