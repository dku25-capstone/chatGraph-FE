"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  PanelLeftOpen,
  LogIn,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTopicsHistory, TopicHistoryItem } from "@/api/topics-history";
import { toast } from "sonner";
import Image from "next/image";

import { patchTopic, deleteTopic } from "@/api/topics";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topics, setTopics] = useState<TopicHistoryItem[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [editingTopic, setEditingTopic] = useState<TopicHistoryItem | null>(null);
  const [newName, setNewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const filteredTopics = topics.filter((topic) =>
    topic.topicName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchTopics = async () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      try {
        setLoadingTopics(true);
        const fetchedTopics = await getTopicsHistory();
        setTopics(fetchedTopics);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        toast.error("토픽 목록을 불러오지 못했습니다.");
      } finally {
        setLoadingTopics(false);
      }
    } else {
      setTopics([]);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleEdit = async () => {
    if (!editingTopic || !newName.trim()) return;

    const originalTopics = topics;
    const newTopics = topics.map((t) =>
      t.topicId === editingTopic.topicId ? { ...t, topicName: newName } : t
    );
    setTopics(newTopics);
    setEditingTopic(null);

    try {
      await patchTopic(editingTopic.topicId, { newNodeName: newName });
      toast.success("토픽명이 수정되었습니다.");
    } catch (error) {
      toast.error("수정에 실패했습니다. 다시 시도해주세요.");
      setTopics(originalTopics); // Revert on failure
      console.error("Edit failed:", error);
    }
  };

  const handleDelete = async (topicId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const originalTopics = topics;
    const newTopics = topics.filter((t) => t.topicId !== topicId);
    setTopics(newTopics);

    try {
      await deleteTopic(topicId);
      toast.success("삭제 완료");
      router.refresh(); // 현재 토픽 페이지라면 반영되도록
    } catch (error) {
      toast.error("삭제에 실패했습니다. 다시 시도해주세요.");
      setTopics(originalTopics); // Revert on failure
      console.error("Deletion failed:", error);
    }
  };

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
                <Image
                  src="/chatlogo.png" // public 폴더 기준
                  alt="Chat Logo"
                  width={30}
                  height={30}
                  className="h-6 w-6"
                />
                <Link href="/">
                  <span className="font-semibold cursor-pointer">
                    ChatGraph
                  </span>
                </Link>
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
              tooltip="검색"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
              <Search />
              <span>검색</span>
            </SidebarMenuButton>
            {isSearchVisible && state === "expanded" && (
              <div className="mt-2">
                <SidebarInput
                  placeholder="검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="새 채팅" asChild>
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
                <div className="text-center text-sm text-gray-500">
                  로딩 중...
                </div>
              ) : topics.length > 0 ? (
                <SidebarMenu>
                  {filteredTopics.map((topic) => (
                    <SidebarMenuItem key={topic.topicId}>
                      <SidebarMenuButton asChild>
                        {editingTopic?.topicId === topic.topicId ? (
                          <div className="flex items-center gap-2 w-full">
                            <SidebarInput
                              autoFocus
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleEdit()
                              }
                              className="flex-1 h-8 text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={handleEdit}
                              className="h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingTopic(null)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <Link
                              href={`/${topic.topicId}`}
                              className="flex items-center gap-2 flex-1"
                            >
                              <span className="truncate">
                                {topic.topicName}
                              </span>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                  <MoreHorizontal />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                side="right"
                                align="start"
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTopic(topic);
                                    setNewName(topic.topicName);
                                  }}
                                >
                                  <span>수정</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(topic.topicId)}
                                >
                                  <span>삭제</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  저장된 채팅이 없습니다.
                </div>
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
