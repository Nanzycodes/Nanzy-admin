import { nanzyLogo } from "@/lib/utils";
import Image from "next/image";
import React from "react";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col justify-between py-10 px-11">
      <div className="flex items-center gap-3">
        <Image
          src={nanzyLogo}
          alt="Nanzy logo"
          width={100}
          height={100}
          className="rounded-full object-cover"
          unoptimized
          loading="eager"
        />
        <span className="text-xl font-semibold tracking-wide text-foreground">
          Nanzy
        </span>
      </div>
      {children}

      <span className="">©2025. Nanzy</span>
    </div>
  );
}

export default AuthLayout;

export const InnerContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-6 border rounded-[5px] w-full max-w-[427px] mx-auto">
      {children}
    </div>
  );
};
