import { AuthLayout } from "@/components/auth-layout";
import { CustomSignInForm } from "@/components/auth/custom-sign-in-form";
import { resolveAuthRedirectUrl } from "@/lib/auth-redirect";

interface SignInPageProps {
  searchParams: Promise<{ redirect_url?: string | string[] }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const sp = await searchParams;
  const raw = sp.redirect_url;
  const rawStr = Array.isArray(raw) ? raw[0] : raw;
  const redirectUrl = resolveAuthRedirectUrl(rawStr, "/profile");

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your creative vault."
    >
      <CustomSignInForm redirectUrl={redirectUrl} />
    </AuthLayout>
  );
}
