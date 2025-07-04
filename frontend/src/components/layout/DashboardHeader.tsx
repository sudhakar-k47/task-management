import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, logout as apiLogout } from "@/lib/api";
import { redirect } from "react-router-dom";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem
} from "@/components/ui/menubar";

interface DashboardHeaderProps {
  onLogout?: () => void;
}

export const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const { toast } = useToast();
  const user = getCurrentUser();

  const handleLogout = () => {
    apiLogout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    redirect("/login");
    onLogout?.();
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Manage your tasks and team</p>
      </div>

      <div className="flex items-center gap-4">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger asChild>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center cursor-pointer">
                <span className="text-primary-foreground font-medium text-sm">
                  {user?.username?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            </MenubarTrigger>
            <MenubarContent align="end">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">{user?.username || "Guest"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "Not logged in"}</p>
              </div>
              <MenubarItem onClick={handleLogout} className="text-destructive">
                Logout
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </header>
  );
};

export default DashboardHeader;
