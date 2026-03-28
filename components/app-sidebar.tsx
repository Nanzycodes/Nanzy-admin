"use client";

import * as React from "react";
import {
  LayoutGrid,
  SquareUser,
  Archive,
  CreditCard,
  Package,
  TrendingUp,
  Settings,
} from "lucide-react";
import Image from "next/image";

function ContentActiveIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/images/content-icon.svg"
      alt="Content"
      width={18}
      height={18}
      className={className}
    />
  );
}

function ContentInactiveIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/images/content-non-active-icon.svg"
      alt="Content"
      width={18}
      height={18}
      className={className}
    />
  );
}
// import {
//   LayoutGrid,
//   SquareUser,
//   Archive,
//   CreditCard,
//   Package,
//   TrendingUp,
// } from "lucide-solid";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { pearlyLogo } from "@/lib/utils";
import { useEffect } from "react";
import adminAuthApi, { AdminProfile } from "@/lib/auth";

export const navData = {
  user: {
    name: "John Doe",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Pearly",
      logo: pearlyLogo,
      url: "/dashboard",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Users",
      url: "/user-management",
      icon: SquareUser,
    },
    {
      title: "Products",
      url: "/product-management",
      icon: Archive,
    },
    {
      title: "Content",
      url: "/content-management",
      icon: ContentActiveIcon,
      inactiveIcon: ContentInactiveIcon,
    },
    {
      title: "Payments",
      url: "/payment",
      icon: CreditCard,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: Package,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: TrendingUp,
    },
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: Settings,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<AdminProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    adminAuthApi.getProfile().then(setUser).catch(console.error);
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      variant="sidebar"
      className="bg-[#FFFFFF] border border-[#E6E6E6]"
    >
      <SidebarHeader>
        <TeamSwitcher teams={navData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/settings"}>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className={`w-4.5 h-4.5 ${pathname === "/settings" ? "text-[#635BFF]" : ""}`} />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail className="-" />
    </Sidebar>
  );
}
