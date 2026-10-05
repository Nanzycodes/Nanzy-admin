"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import adminAuthApi from "@/lib/auth";

const Logout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await adminAuthApi.logout();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div
        className="flex flex-col items-center gap-6"
        style={{
          width: 420,
          minHeight: 330,
          borderRadius: 5,
          background: "rgba(255, 255, 255, 0.4)",
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: 18,
          paddingRight: 18,
        }}
      >
        {/* Logo */}
        <Image
          src="/images/logout.svg"
          alt="Logout"
          width={86}
          height={73}
          style={{ borderRadius: 5 }}
        />

        {/* Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2
            style={{
              fontFamily: "Satoshi Variable, sans-serif",
              fontWeight: 500,
              fontSize: 24,
              lineHeight: "120%",
              letterSpacing: "-0.02em",
              color: "#212121",
            }}
          >
            Logout
          </h2>

          <p
            style={{
              fontFamily: "Satoshi Variable, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              lineHeight: "145%",
              letterSpacing: "0%",
              color: "#616161",
            }}
          >
            Are you sure you want to logout
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleLogout}
            className="w-full rounded-[5px] bg-primary text-sm text-white py-5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            Yes, Log out
          </button>

          <button
            onClick={() => router.back()}
            className="w-full rounded-[5px] bg-transparent text-sm text-[#212121] py-5 cursor-pointer hover:bg-[#F5F5F5] transition-colors border border-[#E6E6E6]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
