"use client";

import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import z from "zod";
import { resetPasswordSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";

type FormValues = z.infer<typeof resetPasswordSchema>;

function Page() {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const onSubmit = (data: any) => {
    // const payload: loginPayload = {
    //   email: data.email,
    // };
    console.log(data);
  };

  return (
    <AuthLayout>
      <InnerContainer>
        <div className="flex flex-col gap-0.5 mb-5">
          <h1 className="font-mono text-[32px] font-bold">Reset Password</h1>
          <p className="text-sm text-[#616161]">Please enter a new password</p>
        </div>

        <form
          className="flex flex-col gap-y-4 w-full mb-5.5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <InputWrapper
              type="password"
              name="password"
              placeholder="Enter your password here"
              control={control}
              startIcon={<LockKeyhole size={16} className="text-primary" />}
            />
          </div>

          <div>
            <InputWrapper
              type="password"
              name="password"
              placeholder="Confirm your new password here"
              control={control}
              startIcon={<LockKeyhole size={16} className="text-primary" />}
            />
          </div>

          <Button
            type="submit"
            // disabled={isPending}
            className="w-full rounded-[5px] bg-primary text-sm text-[#fff] py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
            {/* {isPending ? "Logging in..." : "Login"} */}
            {/* {!isPending && <Image src={rightArrow2} alt="go right" />} */}
          </Button>
        </form>

        <div className="flex justify-end">
          <Link href="/sign-in" className="text-sm">
            Back to login
          </Link>
        </div>
      </InnerContainer>
    </AuthLayout>
  );
}

export default Page;
