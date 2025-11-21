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
import { TopicHistoryItem } from "@/api/topics-history";
import { toast } from "sonner";
import Image from "next/image";
import { searchQuestions, QuestionNode } from "@/api/questions";

import { patchTopic, deleteTopic } from "@/api/topics";
import { useTopicStore } from "@/lib/topic-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SearchResultNode extends QuestionNode {
  topicId: string;
}

// 글래스모피즘 스타일 스켈레톤 컴포넌트
const SidebarSkeleton = () => {
  return (
    <div className="space-y-1 px-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 h-8 w-full rounded-md animate-pulse"
        >
          <div className="h-4 flex-1 rounded bg-black/5 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
};

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { topics, fetchTopics, updateTopic, removeTopic, setTopics } =
    useTopicStore();
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setLoadingTopics(true);
      fetchTopics().finally(() => setLoadingTopics(false));
    } else {
      setTopics([]);
      setLoadingTopics(false);
    }
  }, [isLoggedIn, fetchTopics, setTopics]);

  const handleEdit = async () => {
    if (!editingTopic || !newName.trim()) return;

    const originalTopics = useTopicStore.getState().topics;
    updateTopic(editingTopic.topicId, newName);
    setEditingTopic(null);

    try {
      await patchTopic(editingTopic.topicId, { newNodeName: newName });
      toast.success("토픽명이 수정되었습니다.");
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
        const originalTopics = useTopicStore.getState().topics;
        removeTopic(topicId);

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
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    toast.success("로그아웃 되었습니다.");
  };

  const glassDropdownClass =
    "bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl";

  // [변경] 클릭 효과(active:scale) 제거, 호버 효과만 유지
  const hoverEffectClass = 
    "transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/20 dark:border-white/10 bg-gray/100 dark:bg-black/40 backdrop-blur-xl shadow-lg transition-all duration-300"
    >
      <SidebarHeader className="p-2 bg-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {state === "expanded" ? (
              <>
                <Image
                  src="/chatlogo.png"
                  alt="Chat Logo"
                  width={30}
                  height={30}
                  className="h-6 w-6 opacity-90"
                />
                <Link href="/">
                  <span className="font-semibold cursor-pointer text-gray-800 dark:text-gray-100">
                    ChatGraph
                  </span>
                </Link>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className={hoverEffectClass}
                  >
                    <PanelLeftOpen />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>사이드바 열기</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {state === "expanded" && (
            <SidebarTrigger className={hoverEffectClass} />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 bg-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            {isLoggedIn ? (
              <SidebarMenuButton
                tooltip="검색"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className={hoverEffectClass}
              >
                <Search />
                <span>검색</span>
              </SidebarMenuButton>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <SidebarMenuButton
                      disabled
                      className="w-full cursor-not-allowed opacity-50"
                    >
                      <Search />
                      <span>검색</span>
                    </SidebarMenuButton>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>로그인이 필요합니다</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isLoggedIn && isSearchVisible && state === "expanded" && (
              <div className="mt-2 px-1">
                <SidebarInput
                  placeholder="검색어를 입력하세요..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-white/30 dark:bg-black/30 border-white/20 dark:border-white/10 focus:bg-white/50 dark:focus:bg-black/50 backdrop-blur-sm transition-all"
                />
              </div>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="새 채팅"
              asChild
              className={hoverEffectClass}
            >
              <Link href="/">
                <Plus />
                <span>새 채팅 만들기</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {state === "expanded" && (
          <Separator />
        )}

        {state === "expanded" && (
          <SidebarGroup className="mt-0 flex-1">
            <SidebarGroupLabel className="text-gray-600 dark:text-gray-400 px-2 font-medium">
              {searchTerm.trim() !== "" ? "검색목록" : "채팅목록"}
            </SidebarGroupLabel>
            <SidebarGroupContent className="flex-1">
              <ScrollArea className="h-[calc(100vh-14rem)] pr-2">
              {loadingTopics ? (
                <SidebarSkeleton />
              ) : searchTerm.trim() !== "" ? (
                <SidebarMenu>
                  {searchResults.map((item) => (
                    <SidebarMenuItem key={item.questionId}>
                      <SidebarMenuButton
                        asChild
                        className={hoverEffectClass}
                      >
                        <Link
                          href={`/${item.topicId}?question=${item.questionId}`}
                          className="flex items-center flex-1"
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
                      <SidebarMenuButton
                        asChild
                        className={`group ${hoverEffectClass} data-[active=true]:bg-white/40`}
                      >
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
                              className="flex-1 h-8 text-sm bg-white/40 dark:bg-black/40 border-white/30"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={handleEdit}
                              className="h-8 w-8 hover:bg-white/30"
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
                              <span className="truncate font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                                {item.topicName}
                              </span>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction className="hover:bg-white/50 dark:hover:bg-white/20 text-gray-500 transition-colors">
                                  <MoreHorizontal />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                side="right"
                                align="start"
                                className={glassDropdownClass}
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTopic(item);
                                    setNewName(item.topicName);
                                  }}
                                  className="focus:bg-white/20 dark:focus:bg-white/10 cursor-pointer"
                                >
                                  <span>수정</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => confirmDelete(item.topicId)}
                                  className="text-red-500 focus:bg-red-500/10 focus:text-red-600 cursor-pointer"
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
                <div className="text-center text-sm text-gray-500/80 mt-4">
                  저장된 채팅이 없습니다.
                </div>
              )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2 bg-transparent">
        {isAuthLoading ? (
          <div className="space-y-2 px-2">
             <div className="h-8 w-full rounded-md bg-black/5 dark:bg-white/10 animate-pulse" />
          </div>
        ) : (
          <SidebarMenu>
            {isLoggedIn ? (
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className={hoverEffectClass}>
                      <User2 />
                      {state === "expanded" && <span>Username</span>}
                      {state === "expanded" && (
                        <ChevronUp className="ml-auto opacity-50" />
                      )}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className={`w-[--radix-popper-anchor-width] ${glassDropdownClass}`}
                  >
                    <DropdownMenuItem className="focus:bg-white/20 dark:focus:bg-white/10 cursor-pointer">
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/20 dark:focus:bg-white/10 cursor-pointer">
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={handleLogout}
                        className="focus:bg-white/20 dark:focus:bg-white/10 cursor-pointer"
                    >
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ) : (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={hoverEffectClass}>
                    <Link href="/login">
                      <LogIn />
                      {state === "expanded" && <span>로그인</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={hoverEffectClass}>
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