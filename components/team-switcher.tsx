"use client";

import * as React from "react";
import Image, { StaticImageData } from "next/image";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: string | StaticImageData;
    url: string;
  }[];
}) {
  // const { toggleSidebar } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className="text-sidebar-primary-foreground flex items-center justify-center size-2/4"
          // onClick={() => toggleSidebar()}
        >
          <Image src={activeTeam.logo} alt="Logo" className="w-full" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
