import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import ResetPasswordClient from "@/components/reset-password";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { uid?: string; token?: string };
}) {
  const uid = searchParams.uid || "";
  const token = searchParams.token || "";

  return (
    <AuthLayout>
      <InnerContainer>
        <h1 className="font-mono text-[32px] font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-[#616161] mb-4">Enter your new password</p>

        <ResetPasswordClient uid={uid} token={token} />
      </InnerContainer>
    </AuthLayout>
  );
}
