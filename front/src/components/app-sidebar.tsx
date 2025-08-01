
"use client";

import { useEffect, useState } from "react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  User2,
  ChevronUp,
  Plus,
  MoreHorizontal,
  Search,
  MessageSquare,
  PanelLeftOpen,
  LogIn,
  UserPlus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTopicsHistory, TopicHistoryItem } from "@/api/topics-history";
import { toast } from "sonner";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topics, setTopics] = useState<TopicHistoryItem[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchTopics = async () => {
      if (!!token) {
        try {
          setLoadingTopics(true);
          const fetchedTopics = await getTopicsHistory();
          console.log(fetchedTopics)
          setTopics(fetchedTopics);
        } catch (error) {
          console.error("Failed to fetch topics:", error);
          toast.error("토픽 목록을 불러오는데 실패했습니다.");
        } finally {
          setLoadingTopics(false);
        }
      } else {
        setTopics([]);
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast.success("로그아웃 되었습니다.");
  };

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
            {isSearchVisible && state === "expanded" && (
              <div className="mt-2">
                <SidebarInput
                  placeholder="Search..."
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
              {loadingTopics ? (
                <div className="text-center text-sm text-gray-500">로딩 중...</div>
              ) : topics.length > 0 ? (
                <SidebarMenu>
                  {topics.map((topic) => (
                    <SidebarMenuItem key={topic.topicId}>
                      <SidebarMenuButton asChild>
                        <Link href={`/${topic.topicId}`} className="flex items-center gap-2">
                          <span>{topic.topicName}</span>
                        </Link>
                      </SidebarMenuButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction>
                            <MoreHorizontal />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem>
                            <span>Edit {topic.topicName}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <span>Delete {topic.topicName}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : (
                <div className="text-center text-sm text-gray-500">저장된 채팅이 없습니다.</div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {isLoggedIn ? (
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
                  <DropdownMenuItem onClick={handleLogout}>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/login">
                    <LogIn />
                    {state === "expanded" && <span>로그인</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/register">
                    <UserPlus />
                    {state === "expanded" && <span>회원가입</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
