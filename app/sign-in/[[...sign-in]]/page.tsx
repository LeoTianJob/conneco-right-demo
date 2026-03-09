import { AuthLayout } from "@/components/auth-layout";
import { CustomSignInForm } from "@/components/auth/custom-sign-in-form";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your creative vault."
    >
      <CustomSignInForm />
    </AuthLayout>
  );
}
