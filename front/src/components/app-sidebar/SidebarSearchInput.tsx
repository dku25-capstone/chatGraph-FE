"use client";

import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSearchInputProps {
  isLoggedIn: boolean;
  isSearchVisible: boolean;
  searchTerm: string;
  sidebarState: "expanded" | "collapsed";
  itemClass: string;
  handleSearch: (term: string) => void;
  setIsSearchVisible: (visible: boolean) => void;
}

export function SidebarSearchInput({
  isLoggedIn,
  isSearchVisible,
  searchTerm,
  sidebarState,
  itemClass,
  handleSearch,
  setIsSearchVisible,
}: SidebarSearchInputProps) {
  return (
    <SidebarMenuItem>
      {isLoggedIn ? (
        <div className="space-y-2">
          <SidebarMenuButton
            tooltip="검색"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className={itemClass}
          >
            <Search className="h-5 w-5 opacity-70" />
            <span className="font-medium">검색</span>
          </SidebarMenuButton>

          {isLoggedIn && isSearchVisible && sidebarState === "expanded" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <SidebarInput
                placeholder="질문 검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                  "h-10 rounded-xl px-3 text-sm transition-all",
                  "bg-black/5 dark:bg-white/5",
                  "border-transparent focus:border-white/20",
                  "placeholder:text-gray-500/70 focus:bg-black/10 dark:focus:bg-white/10"
                )}
              />
            </div>
          )}
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full cursor-not-allowed opacity-50">
              <SidebarMenuButton disabled className={itemClass}>
                <Search className="h-5 w-5" />
                <span>검색</span>
              </SidebarMenuButton>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>로그인이 필요합니다</p>
          </TooltipContent>
        </Tooltip>
      )}
    </SidebarMenuItem>
  );
}
