import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth-layout";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your creative vault."
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full mx-auto",
            card: "bg-transparent shadow-none border-none p-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            logoBox: "hidden",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground text-xs",
            formFieldLabel: "text-foreground font-medium",
            formFieldInput:
              "bg-background border-border text-foreground rounded-md transition-colors focus:ring-ring focus:border-ring h-11",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors font-medium border border-primary h-11 w-full",
            socialButtonsBlockButton:
              "bg-card border-border text-foreground hover:bg-muted transition-colors rounded-md font-medium h-11",
            socialButtonsBlockButtonText: "font-medium text-foreground",
            footerActionLink: "text-primary hover:text-primary/80 font-medium",
            footerActionText: "text-muted-foreground",
            footer: "hidden", // We hide the clerk footer because we built our own at the bottom of AuthLayout
          },
        }}
      />
    </AuthLayout>
  );
}
