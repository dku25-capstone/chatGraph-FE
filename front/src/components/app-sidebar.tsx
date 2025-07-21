"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarTrigger,
  useSidebar,
  SidebarInput,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import {
  User2,
  ChevronUp,
  Plus,
  MoreHorizontal,
  Search,
  MessageSquare,
  PanelLeftOpen,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const allProjects = [
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
  ]

  const [projects, setProjects] = useState(allProjects)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    if (term) {
      setProjects(
        allProjects.filter((project) =>
          project.name.toLowerCase().includes(term)
        )
      )
    } else {
      setProjects(allProjects)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {state === "expanded" ? (
              <>
                <MessageSquare className="h-6 w-6" />
                <span className="font-semibold">ChatGraph</span>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    <PanelLeftOpen />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>사이드바 열기</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {state === "expanded" && <SidebarTrigger />}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
              <Search />
              <span>Search</span>
            </SidebarMenuButton>
            {isSearchVisible && state === 'expanded' && (
              <div className="mt-2">
                <SidebarInput
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="New Chat" asChild>
              <Link href="/">
                <Plus />
                <span>새 채팅 만들기</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {state === "expanded" && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel>채팅목록</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton asChild>
                      <a href={project.url} className="flex items-center gap-2">
                        <span>{project.name}</span>
                      </a>
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  {state === "expanded" && <span>Username</span>}
                  {state === "expanded" && <ChevronUp className="ml-auto" />}
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
  )
}
