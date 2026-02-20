"use client";

import { ChevronRight, FileQuestion, LogOut, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
// import { getNameInitials } from "@workspace/ui/lib/helper";

export function NavUser({ user }: { user: any }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* <Avatar className="h-8 w-8 rounded-[2px]">
                <AvatarFallback className="rounded-[2px] bg-[#0088FF] text-white">
                  {getNameInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar> */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium capitalize">
                  {user?.full_name}
                </span>
              </div>
              <ChevronRight className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-6"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm mb-1">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-sm text-[#657E95]">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Settings />
                Setting
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <FileQuestion />
                Help
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-4" />
            <DropdownMenuItem>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
