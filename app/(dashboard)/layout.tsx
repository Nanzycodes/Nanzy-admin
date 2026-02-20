"use client";
import { AppSidebar } from "@/components/app-sidebar";
import ProtectedRoute from "@/components/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Headers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider className="">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="px-6 lg:px-[56px] pb-[40px] pt-[30px]">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
