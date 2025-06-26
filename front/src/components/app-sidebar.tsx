"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { User2, ChevronUp, Plus, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
//url 대신 fetch 질문 토픽들에 대한 id를 불러와야함 id면 채팅 전체 id/graph면 채팅 조회

const projects = [
  {
    name: "DB 정규화 방법",
    url: "/1",
  },
  {
    name: "운영체제 프로세스 스위칭 정책",
    url: "/2",
  },
  {
    name: "IPv4 프로토콜 개요",
    url: "/3",
  },
];

export function AppSidebar() {
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>채팅목록</SidebarGroupLabel>
          <SidebarGroupAction>
            <Link href="/home">
              <Plus />
              <span className="sr-only">Add Project</span>
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => {
                const id = project.url.replace("/", "");

                return (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton asChild>
                      <div className="flex items-center gap-2">
                        {/* 그래프 보기 버튼 */}
                        <button
                          onClick={() => {
                            console.log("클릭!!");
                            router.push(`/graph/${id}`);
                          }}
                        >
                          📊
                        </button>
                        <a
                          href={project.url}
                          className="flex items-center gap-3"
                        >
                          <span>{project.name}</span>
                        </a>
                      </div>
                    </SidebarMenuButton>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem>
                          <span>Edit {project.name}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span>Delete {project.name}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
