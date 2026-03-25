import { AuthLayout } from "@/components/auth-layout";
import { CustomSignUpForm } from "@/components/auth/custom-sign-up-form";
import { resolveAuthRedirectUrl } from "@/lib/auth-redirect";

interface SignUpPageProps {
  searchParams: Promise<{ redirect_url?: string | string[] }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const sp = await searchParams;
  const raw = sp.redirect_url;
  const rawStr = Array.isArray(raw) ? raw[0] : raw;
  const redirectUrl = resolveAuthRedirectUrl(rawStr, "/profile");

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Conneco Right and protect your creative legacy."
    >
      <CustomSignUpForm redirectUrl={redirectUrl} />
    </AuthLayout>
  );
}
