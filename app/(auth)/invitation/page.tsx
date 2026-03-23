// page.tsx
import { Suspense } from "react";
import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import InviteAdmin from "@/components/invite-admin";

export default function InvitePage() {
  return (
    <AuthLayout>
      <InnerContainer>
        <h1 className="font-mono text-[32px] font-bold mb-2">Welcome! 🎉</h1>
        <p className="text-sm text-[#616161] mb-2">
          Set your password to access the dashboard.
        </p>

        <Suspense fallback={<p>Loading...</p>}>
          <InviteAdmin />
        </Suspense>
      </InnerContainer>
    </AuthLayout>
  );
}
