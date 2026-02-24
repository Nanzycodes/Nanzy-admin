"use client";

import * as React from "react";
import {
  LayoutGrid,
  SquareUser,
  Archive,
  CreditCard,
  Package,
  TrendingUp,
} from "lucide-react";
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { pearlyLogo } from "@/lib/utils";
import { useEffect } from "react";

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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userInfo = localStorage.getItem("pearly-admin");
        if (userInfo) {
          setUser(JSON.parse(userInfo));
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      variant="sidebar"
      className="bg-[#FFFFFF] border-[1px] border-[#E6E6E6]"
    >
      <SidebarHeader>
        <TeamSwitcher teams={navData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail className="-" />
    </Sidebar>
  );
}
