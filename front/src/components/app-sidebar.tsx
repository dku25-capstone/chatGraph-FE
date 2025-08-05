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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTopicsHistory, TopicHistoryItem } from "@/api/topics-history";
import { toast } from "sonner";
import Image from "next/image";
import { searchQuestions, QuestionNode } from "@/api/questions";

import { patchTopic, deleteTopic } from "@/api/topics";
import LoadingSpinner from "@/components/ui/loading-spinner"; // 로딩 스피너 컴포넌트 임포트
import { useTopicStore } from "@/lib/topic-store";

interface SearchResultNode extends QuestionNode {
  topicId: string;
}

  export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [topics, setTopics] = useState<TopicHistoryItem[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // 인증 로딩 상태 추가
  const [editingTopic, setEditingTopic] = useState<TopicHistoryItem | null>(
    null
  );
  const [newName, setNewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultNode[]>([]);
  const router = useRouter();

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await searchQuestions(term);
      if (response && Array.isArray(response)) {
        const allNodes: SearchResultNode[] = [];
        response.forEach((item) => {
          if (item && item.nodes) {
            const nodes = Object.keys(item.nodes).map((nodeId) => {
              const node = item.nodes[nodeId];
              return {
                ...node,
                topicId: item.topic,
              };
            });
            allNodes.push(...nodes);
          }
        });
        setSearchResults(allNodes);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to search questions:", error);
      setSearchResults([]);
      toast.error("검색 중 오류가 발생했습니다.");
    }
  };

  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);
      const fetchedTopics = await getTopicsHistory();
      const sortedTopics = fetchedTopics.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTopics(sortedTopics);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      toast.error("토픽 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTopics();
    } else {
      setTopics([]);
      setLoadingTopics(false);
    }
  }, [isLoggedIn]);

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
      // Update the global topic store if this is the currently active topic
      if (useTopicStore.getState().currentTopicId === editingTopic.topicId) {
        useTopicStore.getState().setTopic(editingTopic.topicId, newName);
      }
    } catch (error) {
      toast.error("수정에 실패했습니다. 다시 시도해주세요.");
      setTopics(originalTopics);
      console.error("Edit failed:", error);
    }
  };

  const handleDelete = async (topicId: string) => {
    const promise = () =>
      new Promise(async (resolve, reject) => {
        const originalTopics = topics;
        const newTopics = topics.filter((t) => t.topicId !== topicId);
        setTopics(newTopics);

        try {
          await deleteTopic(topicId);
          resolve("삭제 완료");
          router.refresh();
        } catch (error) {
          setTopics(originalTopics);
          console.error("Deletion failed:", error);
          reject("삭제에 실패했습니다. 다시 시도해주세요.");
        }
      });

    toast.promise(promise(), {
      loading: "삭제 중...",
      success: (message) => message as string,
      error: (message) => message as string,
    });
  };

  const confirmDelete = (topicId: string) => {
    toast("정말 삭제하시겠습니까?", {
      action: {
        label: "삭제",
        onClick: () => handleDelete(topicId),
      },
    });
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
                  src="/chatlogo.png"
                  alt="Chat Logo"
                  width={30}
                  height={30}
                  className="h-6 w-6"
                />
                <Link href="/">
                  <span className="font-semibold cursor-pointer">ChatGraph</span>
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
                  onChange={(e) => handleSearch(e.target.value)}
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
            <SidebarGroupLabel>
              {searchTerm.trim() !== "" ? "검색목록" : "채팅목록"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {loadingTopics ? (
                <div className="flex justify-center items-center h-20">
                  <LoadingSpinner />
                </div>
              ) : searchTerm.trim() !== "" ? (
                <SidebarMenu>
                  {searchResults.map((item) => (
                    <SidebarMenuItem key={item.questionId}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={`/${item.topicId}?question=${item.questionId}`}
                          className="flex items-center gap-2 flex-1"
                        >
                          <span className="truncate">{item.questionText}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : topics.length > 0 ? (
                <SidebarMenu>
                  {topics.map((item) => (
                    <SidebarMenuItem key={item.topicId}>
                      <SidebarMenuButton asChild>
                        {editingTopic?.topicId === item.topicId ? (
                          <div className="flex items-center gap-2 w-full">
                            <SidebarInput
                              autoFocus
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEdit();
                                else if (e.key === "Escape")
                                  setEditingTopic(null);
                              }}
                              onBlur={() => {
                                if (editingTopic) handleEdit();
                              }}
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
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <Link
                              href={`/${item.topicId}`}
                              className="flex items-center gap-2 flex-1 min-w-0"
                            >
                              <span className="truncate">{item.topicName}</span>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                  <MoreHorizontal />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTopic(item);
                                    setNewName(item.topicName);
                                  }}
                                >
                                  <span>수정</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => confirmDelete(item.topicId)}
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
        {isAuthLoading ? (
          <div className="text-center text-sm text-gray-500"></div>
        ) : (
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
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
