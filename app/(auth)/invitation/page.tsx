"use client";

import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { LockKeyhole, Mail } from "lucide-react";

function Page() {
  //   const onSubmit = (data: any) => {

  //     console.log(data);
  //   };

  return (
    <AuthLayout>
      <InnerContainer>
        <div className="flex flex-col gap-1 mb-5">
          <h1 className="font-mono text-[32px] font-bold">Welcome John! 🎉</h1>
          <p className="text-sm text-[#616161]">
            You’ve been invited to access Pearly admin dashboard. Get started by
            setting up your account and exploring your dashboard.
          </p>

          <p className="text-sm text-[#9E9E9E]">
            Click on accept invite to continue{" "}
          </p>
        </div>

        <Button
          type="submit"
          // disabled={isPending}
          className="w-full rounded-[5px] bg-primary text-sm text-[#fff] py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Accept Invite
          {/* {isPending ? "Logging in..." : "Login"} */}
          {/* {!isPending && <Image src={rightArrow2} alt="go right" />} */}
        </Button>
      </InnerContainer>
    </AuthLayout>
  );
}

export default Page;
