"use client";

import Image, { StaticImageData } from "next/image";

import {
  SidebarMenu,
  SidebarMenuItem,
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
  const activeTeam = teams[0];

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2">
          <Image
            src={activeTeam.logo}
            alt={`${activeTeam.name} logo`}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
            unoptimized
            loading="eager"
          />
          <span className="text-sm font-semibold tracking-wide text-foreground">
            {activeTeam.name}
          </span>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
