"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, PanelLeftOpen, ChevronDown } from "lucide-react";

// Shadcn UI 사이드바 및 관련 컴포넌트 임포트
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// API 및 유틸리티 임포트
import { TopicHistoryItem } from "@/api/topics-history";
import { cn } from "@/lib/utils";
import { SIDEBAR_CONFIG } from "@/constants/ui-constants";

// Hook 임포트 (Rule 1.3 해결)
import { useSidebarData, SearchResultNode } from "./hooks/use-sidebar-data";

// 하위 컴포넌트 임포트
import { TopicList } from "./app-sidebar-components/topic-list";
import { UserFooter } from "./app-sidebar-components/user-footer";
import { SidebarSearchInput } from "./app-sidebar-components/sidebar-search-input";
import { SearchResultsList } from "./app-sidebar-components/search-results-list";

// 사이드바 로딩 시 표시할 스켈레톤 UI 컴포넌트
const SidebarSkeleton = () => (
  <div className="space-y-2 px-2">
    {[...Array(SIDEBAR_CONFIG.SKELETON_COUNT)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-2 h-10 w-full rounded-xl animate-pulse bg-black/5 dark:bg-white/10"
      />
    ))}
  </div>
);

// 메인 앱 사이드바 컴포넌트
export function AppSidebar() {
  // 사이드바 상태 (펼침/접힘) 및 토글 함수 Hook
  const { state, toggleSidebar } = useSidebar();
  const router = useRouter();

  // --- 상태 관리 (UI 상태만 남김) ---
  const [isSearchVisible, setIsSearchVisible] = useState(false); // 검색 입력창 표시 여부
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [isAuthLoading, setIsAuthLoading] = useState(true); // 인증 정보 로딩 상태
  const [editingTopic, setEditingTopic] = useState<TopicHistoryItem | null>(null); // 현재 수정 중인 토픽
  const [newName, setNewName] = useState(""); // 수정할 토픽의 새 이름
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [searchResults, setSearchResults] = useState<SearchResultNode[]>([]); // 검색 결과 목록
  const [isFavoriteListExpanded, setIsFavoriteListExpanded] = useState(true); // 즐겨찾기 목록 펼침 여부

  // 초기 인증 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setIsAuthLoading(false);
  }, []);

  // --- 데이터 관리 (Custom Hook으로 위임) ---
  const {
    topics,
    loadingTopics,
    updateTopic,
    removeTopic,
    toggleFavorite,
    searchQuestions
  } = useSidebarData(isLoggedIn);

  // 즐겨찾기된 토픽과 그렇지 않은 토픽 분류
  const favoriteTopics = topics.filter((topic) => topic.favorite);
  const nonFavoriteTopics = topics.filter((topic) => !topic.favorite);

  // --- 핸들러 함수 ---

  // 검색 처리 함수
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchQuestions(term);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
      toast.error("검색 중 오류가 발생했습니다.");
    }
  };

  // 토픽 이름 수정 시작 핸들러
  const handleStartEdit = (topic: TopicHistoryItem | null) => {
    setEditingTopic(topic);
    setNewName(topic ? topic.topicName : "");
  };

  // 토픽 이름 수정 확인 및 API 호출 핸들러
  const handleConfirmEdit = () => {
    if (!editingTopic || !newName.trim()) return;
    updateTopic({ topicId: editingTopic.topicId, newName });
    setEditingTopic(null);
  };

  // 토픽 삭제 확인 및 API 호출 핸들러
  const handleConfirmDelete = (topicId: string) => {
    if (window.confirm("정말로 이 대화를 삭제하시겠습니까?")) {
      removeTopic(topicId, {
        onSuccess: () => {
          // 현재 보고 있는 토픽을 삭제한 경우 홈으로 이동
          if (window.location.pathname.includes(topicId)) {
            router.push("/");
          }
        }
      });
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    toast.success("로그아웃 되었습니다.");
  };

  // --- 스타일 클래스 정의 (기존 유지) ---
  const sidebarClass = cn(
    "ml-3 my-3 h-[calc(100vh-1.5rem)]",
    `w-[${SIDEBAR_CONFIG.WIDTH}px]`,
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
        {state === "expanded" ? (
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 min-w-0 transition-opacity duration-300"
            >
              <div className="relative flex-shrink-0">
                <Image
                  src="/chatlogo.png"
                  alt="Chat Logo"
                  width={SIDEBAR_CONFIG.ICON_SIZE.SMALL}
                  height={SIDEBAR_CONFIG.ICON_SIZE.SMALL}
                  className="relative h-8 w-8 object-contain"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-800 dark:text-gray-100 whitespace-nowrap">
                ChatGraph
              </span>
            </Link>
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 text-gray-500" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center justify-center"
            >
              <Image
                src="/chatlogo.png"
                alt="Chat Logo"
                width={SIDEBAR_CONFIG.ICON_SIZE.LARGE}
                height={SIDEBAR_CONFIG.ICON_SIZE.LARGE}
                className="h-12 w-12 object-contain"
              />
            </Link>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-11 w-11 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 transition-all duration-200"
                >
                  <PanelLeftOpen className="h-6 w-6 opacity-90" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">사이드바 열기</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-11 w-11 rounded-xl hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-200"
                  )}
                >
                  <Link href="/">
                    <Plus className="h-6 w-6 opacity-70" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">새 채팅</TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 bg-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarMenu className="gap-2">
          {state === "expanded" && (
            <SidebarSearchInput
              isLoggedIn={isLoggedIn}
              isSearchVisible={isSearchVisible}
              searchTerm={searchTerm}
              sidebarState={state}
              itemClass={itemClass}
              handleSearch={handleSearch}
              setIsSearchVisible={setIsSearchVisible}
            />
          )}
          {state === "expanded" && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="새 채팅" className={itemClass}>
                <Link href="/">
                  <Plus className="h-5 w-5 opacity-70" />
                  <span className="font-medium">새 채팅 만들기</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        {state === "expanded" && (
          <>
            <div className="my-4 px-2">
              <Separator className="bg-black/10 dark:bg-white/10" />
            </div>

            {favoriteTopics.length > 0 && (
              <SidebarGroup className="pt-0">
                <div
                  className="flex items-center justify-between px-2 mb-2 cursor-pointer"
                  onClick={() =>
                    setIsFavoriteListExpanded(!isFavoriteListExpanded)
                  }
                >
                  <SidebarGroupLabel className="text-xs font-semibold text-gray-500/80 dark:text-gray-400/80 uppercase tracking-wider">
                    Favorites
                  </SidebarGroupLabel>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isFavoriteListExpanded ? "rotate-180" : ""
                      }`}
                  />
                </div>
                {isFavoriteListExpanded && (
                  <SidebarGroupContent>
                    <TopicList
                      topics={favoriteTopics}
                      editingTopic={editingTopic}
                      editingNewName={newName}
                      setEditingNewName={setNewName}
                      onStartEdit={handleStartEdit}
                      onConfirmEdit={handleConfirmEdit}
                      onConfirmDelete={handleConfirmDelete}
                      onToggleFavorite={toggleFavorite}
                      glassDropdownClass={glassDropdownClass}
                    />
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            )}

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
                  ) : nonFavoriteTopics.length > 0 ? (
                    <TopicList
                      topics={nonFavoriteTopics}
                      editingTopic={editingTopic}
                      editingNewName={newName}
                      setEditingNewName={setNewName}
                      onStartEdit={handleStartEdit}
                      onConfirmEdit={handleConfirmEdit}
                      onConfirmDelete={handleConfirmDelete}
                      onToggleFavorite={toggleFavorite}
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
          </>
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