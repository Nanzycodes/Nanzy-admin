"use client";

import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import z from "zod";
import { loginSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";

type FormValues = z.infer<typeof loginSchema>;

function Page() {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = (data: any) => {
    // const payload: loginPayload = {
    //   email: data.email,
    //   password: data.password,
    // };
    console.log(data);
  };

  return (
    <AuthLayout>
      <InnerContainer>
        <div className="flex flex-col gap-0.5 mb-5">
          <h1 className="font-mono text-[32px] font-bold">Welcome Back!</h1>
          <p className="text-sm text-[#616161]">
            Login to access your dashboard
          </p>
        </div>

        <form
          className="flex flex-col gap-y-4 w-full mb-5.5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <InputWrapper
              type="email"
              name="email"
              placeholder="Enter your email here"
              control={control}
              startIcon={<Mail size={16} className="text-primary" />}
            />
          </div>

          <div>
            <InputWrapper
              type="password"
              name="password"
              placeholder="Enter your password here"
              control={control}
              startIcon={<LockKeyhole size={16} className="text-primary" />}
            />
          </div>

          <Button
            type="submit"
            // disabled={isPending}
            className="w-full rounded-[5px] bg-primary text-sm text-[#fff] py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login
            {/* {isPending ? "Logging in..." : "Login"} */}
            {/* {!isPending && <Image src={rightArrow2} alt="go right" />} */}
          </Button>
        </form>

        <div className="flex justify-end">
          <p className="text-sm">
            Forgot Password?{" "}
            <Link href="/forgot-password" className="text-[#9E9E9E]">
              Recover
            </Link>
          </p>
        </div>
      </InnerContainer>
    </AuthLayout>
  );
}

export default Page;
