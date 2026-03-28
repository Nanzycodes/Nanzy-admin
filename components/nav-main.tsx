"use client";

import { type LucideIcon } from "lucide-react";
import type React from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
    inactiveIcon?: React.ComponentType<{ className?: string }>;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;
          const Icon = isActive ? item.icon : (item.inactiveIcon ?? item.icon);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive}>
                <a href={item.url} className="flex items-center gap-2">
                  {Icon && (
                    <Icon
                      className={`w-4.5 h-4.5 ${isActive ? "text-[#635BFF]" : ""}`}
                    />
                  )}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
