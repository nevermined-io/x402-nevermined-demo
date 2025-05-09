"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { 
  SidebarProvider, 
  SidebarTrigger, 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Home, LogOut } from "lucide-react";
import { useEffect, useCallback } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { handleLogOut } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();

  // Simple auth guard - redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  // Handle logout with redirect
  const handleLogoutWithRedirect = useCallback(() => {
    handleLogOut();
    router.push('/');
  }, [handleLogOut, router]);

  // Show loading or the authenticated layout
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-center p-2">
              <h2 className="text-xl font-bold">X402 + Nevermined</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard">
                        <Home />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogoutWithRedirect}>
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <div className="p-2 flex justify-center">
                <ModeToggle />
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <SidebarTrigger />
              <div className="text-xl font-semibold">Dashboard</div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 