import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import CheckInboxClient from "@/components/inbox";

export default function CheckInboxPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email || "";

  return (
    <AuthLayout>
      <InnerContainer>
        <CheckInboxClient email={email} />
      </InnerContainer>
    </AuthLayout>
  );
}
