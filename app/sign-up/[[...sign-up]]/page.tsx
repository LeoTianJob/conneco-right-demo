import { AuthLayout } from "@/components/auth-layout";
import { CustomSignUpForm } from "@/components/auth/custom-sign-up-form";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Conneco Right and protect your creative legacy."
    >
      <CustomSignUpForm />
    </AuthLayout>
  );
}
