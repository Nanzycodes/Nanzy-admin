"use client";
import { AppSidebar } from "@/components/app-sidebar";
import ProtectedRoute from "@/components/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Headers";
import DemoModeNotice from "@/components/demo-mode-notice";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider className="">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="px-6 lg:px-[32px] pb-[40px] pt-7 bg-gradient-to-r from-[#f5f5f5d7] from-0% to-[#e6e5ff9f] to-2%]">
            <DemoModeNotice />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
