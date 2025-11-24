"use client";

import Link from "next/link";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { User2, ChevronUp, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserFooterProps {
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  sidebarState: "expanded" | "collapsed";
  handleLogout: () => void;
  itemClass: string;
  glassDropdownClass: string;
}

export function UserFooter({
  isLoggedIn,
  isAuthLoading,
  sidebarState,
  handleLogout,
  itemClass,
  glassDropdownClass,
}: UserFooterProps) {
  if (isAuthLoading) {
    return (
      <SidebarFooter className="p-3 bg-transparent">
        <div className="h-10 w-full rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
      </SidebarFooter>
    );
  }

  return (
    <SidebarFooter className="p-3 bg-transparent">
      <SidebarMenu>
        {isLoggedIn ? (
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className={cn(itemClass, "h-12 px-3")}>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center text-white shadow-md">
                    <User2 className="h-4 w-4" />
                  </div>
                  {sidebarState === "expanded" && (
                    <>
                      <div className="flex flex-col items-start text-sm ml-1">
                        <span className="font-semibold">Username</span>
                        <span className="text-xs text-gray-500">
                          Pro Plan
                        </span>
                      </div>
                      <ChevronUp className="ml-auto opacity-50" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className={cn(glassDropdownClass, "w-56 mb-2")}
              >
                <DropdownMenuItem className="cursor-pointer">
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Billing
                </DropdownMenuItem>
                <Separator className="my-1 bg-black/5" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 focus:text-red-600"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ) : (
          <div className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={itemClass}>
                <Link href="/login">
                  <LogIn className="h-4 w-4 opacity-70" />
                  {sidebarState === "expanded" && <span>로그인</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={itemClass}>
                <Link href="/register">
                  <UserPlus className="h-4 w-4 opacity-70" />
                  {sidebarState === "expanded" && <span>회원가입</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        )}
      </SidebarMenu>
    </SidebarFooter>
  );
}
