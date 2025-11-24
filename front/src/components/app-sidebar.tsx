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
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  User2,
  ChevronUp,
  Plus,
  MoreVertical,
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
import { cn } from "@/lib/utils";
import { TopicList } from "./app-sidebar/TopicList";
import { UserFooter } from "./app-sidebar/UserFooter";
import { SidebarSearchInput } from "./app-sidebar/SidebarSearchInput";
import { SearchResultsList } from "./app-sidebar/SearchResultsList";

interface SearchResultNode extends QuestionNode {
  topicId: string;
}

const SidebarSkeleton = () => {
  return (
    <div className="space-y-2 px-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 h-10 w-full rounded-xl animate-pulse bg-black/5 dark:bg-white/10"
        />
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
      fetchTopics().finally(() => {
        setTimeout(() => setLoadingTopics(false), 300);
      });
    } else {
      setTopics([]);
      setLoadingTopics(false);
    }
  }, [isLoggedIn, fetchTopics, setTopics]);

  const handleStartEdit = (topic: TopicHistoryItem) => {
    setEditingTopic(topic);
    setNewName(topic ? topic.topicName : "");
  };

  const handleEdit = async () => {
    if (!editingTopic || !newName.trim()) return;
    const originalTopics = useTopicStore.getState().topics;
    updateTopic(editingTopic.topicId, newName);
    setEditingTopic(null);
    try {
      await patchTopic(editingTopic.topicId, { newNodeName: newName });
      toast.success("토픽명이 수정되었습니다.");
    } catch (error) {
      toast.error("수정에 실패했습니다.");
      setTopics(originalTopics);
    }
  };

  const handleDelete = async (topicId: string) => {
    const originalTopics = useTopicStore.getState().topics;
    removeTopic(topicId);
    try {
      await deleteTopic(topicId);
      toast.success("대화가 삭제되었습니다.");
      if (window.location.pathname.includes(topicId)) {
        router.push("/");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("삭제에 실패했습니다.");
      setTopics(originalTopics);
    }
  };

  const confirmDelete = (topicId: string) => {
    if (window.confirm("정말로 이 대화를 삭제하시겠습니까?")) {
      handleDelete(topicId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    toast.success("로그아웃 되었습니다.");
  };

  // 수정: 너비를 280px로 고정하여 안정적인 레이아웃 확보
  const sidebarClass = cn(
    "ml-3 my-3 h-[calc(100vh-1.5rem)]",
    "w-[300px]",
    "rounded-[26px]",
    "border-0",
    "bg-white/60 dark:bg-black/60",
    "backdrop-blur-2xl",
    "border border-white/40 dark:border-white/10",
    "shadow-2xl shadow-black/10",
    "transition-all duration-500 ease-out"
  );

  const glassDropdownClass = cn(
    "bg-white/80 dark:bg-black/80 backdrop-blur-2xl",
    "border border-white/40 dark:border-white/10",
    "shadow-xl rounded-xl"
  );

  const itemClass = cn(
    "rounded-xl transition-all duration-200",
    "hover:bg-black/10 dark:hover:bg-white/20",
    "data-[active=true]:bg-black/15 dark:data-[active=true]:bg-white/25",
    "data-[active=true]:font-medium"
  );

  return (
    <Sidebar collapsible="icon" className={sidebarClass}>
      <SidebarHeader className="p-4 pb-2 bg-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {state === "expanded" ? (
              <Link
                href="/"
                className="flex items-center gap-3 min-w-0 transition-opacity duration-300"
              >
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
                  <Image
                    src="/chatlogo.png"
                    alt="Chat Logo"
                    width={32}
                    height={32}
                    className="relative h-8 w-8 object-contain"
                  />
                </div>
                <span className="font-bold text-lg tracking-tight text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  ChatGraph
                </span>
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="h-10 w-10 rounded-xl hover:bg-white/40 dark:hover:bg-white/10"
                  >
                    <PanelLeftOpen className="h-5 w-5 opacity-70" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">사이드바 열기</TooltipContent>
              </Tooltip>
            )}
          </div>
          {state === "expanded" && (
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 text-gray-500" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 bg-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarMenu className="gap-2">
          <SidebarSearchInput
            isLoggedIn={isLoggedIn}
            isSearchVisible={isSearchVisible}
            searchTerm={searchTerm}
            sidebarState={state}
            itemClass={itemClass}
            handleSearch={handleSearch}
            setIsSearchVisible={setIsSearchVisible}
          />

          {/* 새 채팅 */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="새 채팅" className={itemClass}>
              <Link href="/">
                <Plus className="h-5 w-5 opacity-70" />
                <span className="font-medium">새 채팅 만들기</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {state === "expanded" && (
          <div className="my-4 px-2">
            <Separator className="bg-black/10 dark:bg-white/10" />
          </div>
        )}

        {state === "expanded" && (
          <SidebarGroup className="pt-0">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500/80 dark:text-gray-400/80 px-2 mb-2 uppercase tracking-wider">
              {searchTerm.trim() !== "" ? "Search Results" : "History"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-20rem)] w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {loadingTopics ? (
                  <SidebarSkeleton />
                ) : searchTerm.trim() !== "" ? (
                  <SearchResultsList
                    searchResults={searchResults}
                    itemClass={itemClass}
                  />
                ) : topics.length > 0 ? (
                  <TopicList
                    topics={topics}
                    editingTopic={editingTopic}
                    editingNewName={newName}
                    setEditingNewName={setNewName}
                    onStartEdit={handleStartEdit}
                    onConfirmEdit={handleEdit}
                    onConfirmDelete={confirmDelete}
                    glassDropdownClass={glassDropdownClass}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center p-4 border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl mt-2">
                    <p className="text-sm text-gray-500">
                      저장된 대화가 없습니다
                    </p>
                  </div>
                )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <UserFooter
        isAuthLoading={isAuthLoading}
        isLoggedIn={isLoggedIn}
        sidebarState={state}
        handleLogout={handleLogout}
        itemClass={itemClass}
        glassDropdownClass={glassDropdownClass}
      />
    </Sidebar>
  );
}
