"use client";

import { SidebarContents } from "./SidebarContents";

export function AppSidebar() {
  return (
    <div className="hidden lg:flex flex-col w-64 border-r bg-white h-screen">
      <SidebarContents />
    </div>
  );
}
