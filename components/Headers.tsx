"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// import {
//   imgplaceholder,
//   arrowlogout,
//   logouticon,
//   mystacklogo,
//   menuIcon,
//   search,
//   settings,
//   userIcon,
// } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
// import { pageRoute } from "./app-sidebar";
import { Button } from "./ui/button";
import { navData } from "./app-sidebar";
import { userAvatar } from "@/lib/utils";
import { Input } from "./ui/input";
import { Bell } from "lucide-react";

// const getToken = () => {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem("accessToken");
//   }
//   return null;
// };

export default function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const [userImage, setUserImage] = useState<string>("");

  const activeProject = navData.navMain.find((item) => item.url === pathname);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        setUserImage(user?.profile_picture || "");
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  // // handle logout
  // const handleLogout = () => {
  //   localStorage.removeItem("accessToken");
  //   localStorage.removeItem("user");
  //   router.push("/login");
  // };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-8 py-4 sm:pr-10 border border-[#E6E6E6] rounded-[5px]">
      <div className="flex items-center gap-2">
        {activeProject?.icon && (
          <activeProject.icon className={`w-4.5 h-4.5 `} fill="" />
        )}
        <p>/ {activeProject?.title}</p>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        {/* {!isMobile && (
          <div className="cursor-pointer" onClick={() => openModal("search")}>
            <Image src={search} alt="search" className="h-5 w-5" />
          </div>
        )} */}

        <div>
          <Input placeholder="Search" className="w-50" />
        </div>
        <div className="w-7.5 h-7.5 relative rounded-[5px] bg-[#F5F5F5] overflow-hidden flex justify-center items-center ">
          <Bell className="w-5 h-5 m-auto" fill="" />
        </div>

        {/* Profile dropdown */}
        {/* <div ref={dropdownRef} className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setDropdownOpen((prev) => !prev)}
          > */}
        <div className="w-7.5 h-7.5 relative rounded-[5px] bg-[#F5F5F5] overflow-hidden">
          <Image
            src={userImage || userAvatar}
            alt="Preview"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        {/* {!isMobile && <span className="capitalize">{username}</span>}
            <Image
              src={arrowlogout}
              alt=""
              className={`w-[20px] h-[20px] my-auto transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            /> */}
        {/* </div> */}
        {/* </div> */}
      </div>
    </header>
  );
}
