import { pearlyLogo } from "@/lib/utils";
import Image from "next/image";
import React from "react";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col justify-between py-10 px-11">
      <div>
        <Image src={pearlyLogo} alt="pearly-logo" width={100} height={100} />
      </div>
      {children}

      <span className="">©2025. Pearly</span>
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
