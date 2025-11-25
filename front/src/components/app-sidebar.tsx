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
import { searchQuestions, QuestionNode } from "@/api/questions";
import { patchTopic, deleteTopic } from "@/api/topics";
import { useTopicStore } from "@/lib/topic-store";
import { cn } from "@/lib/utils";

// 하위 컴포넌트 임포트
import { TopicList } from "./app-sidebar/TopicList";
import { UserFooter } from "./app-sidebar/UserFooter";
import { SidebarSearchInput } from "./app-sidebar/SidebarSearchInput";
import { SearchResultsList } from "./app-sidebar/SearchResultsList";

// 검색 결과 노드 인터페이스 정의 (토픽 ID 포함)
interface SearchResultNode extends QuestionNode {
  topicId: string;
}

// 사이드바 로딩 시 표시할 스켈레톤 UI 컴포넌트
const SidebarSkeleton = () => (
  <div className="space-y-2 px-2">
    {[...Array(5)].map((_, i) => (
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

  // --- 상태 관리 ---
  const [isSearchVisible, setIsSearchVisible] = useState(false); // 검색 입력창 표시 여부
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [loadingTopics, setLoadingTopics] = useState(true); // 토픽 목록 로딩 상태
  const [isAuthLoading, setIsAuthLoading] = useState(true); // 인증 정보 로딩 상태
  const [editingTopic, setEditingTopic] = useState<TopicHistoryItem | null>(null); // 현재 수정 중인 토픽
  const [newName, setNewName] = useState(""); // 수정할 토픽의 새 이름
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [searchResults, setSearchResults] = useState<SearchResultNode[]>([]); // 검색 결과 목록
  const [isFavoriteListExpanded, setIsFavoriteListExpanded] = useState(true); // 즐겨찾기 목록 펼침 여부

  // 토픽 스토어 Hook 사용
  const {
    topics,
    fetchTopics,
    updateTopic,
    removeTopic,
    setTopics,
    toggleFavorite,
  } = useTopicStore();

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
      const response = await searchQuestions(term);
      if (response && Array.isArray(response)) {
        // 검색 결과를 평탄화하여 SearchResultNode 배열로 변환
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
    } catch {
      setSearchResults([]);
      toast.error("검색 중 오류가 발생했습니다.");
    }
  };

  // 초기 인증 상태 확인 (마운트 시 1회 실행)
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setIsAuthLoading(false);
  }, []);

  // 로그인 상태에 따른 토픽 목록 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      setLoadingTopics(true);
      // 로딩 UI를 자연스럽게 보여주기 위한 최소 지연 시간 추가
      fetchTopics().finally(() =>
        setTimeout(() => setLoadingTopics(false), 300)
      );
    } else {
      setTopics([]);
      setLoadingTopics(false);
    }
  }, [isLoggedIn, fetchTopics, setTopics]);

  // 토픽 이름 수정 시작 핸들러
  const handleStartEdit = (topic: TopicHistoryItem | null) => {
    setEditingTopic(topic);
    setNewName(topic ? topic.topicName : "");
  };

  // 토픽 이름 수정 확인 및 API 호출 핸들러
  const handleConfirmEdit = async () => {
    if (!editingTopic || !newName.trim()) return;
    const originalTopics = useTopicStore.getState().topics; // 롤백을 위한 백업
    updateTopic(editingTopic.topicId, newName); // 낙관적 업데이트
    setEditingTopic(null);
    try {
      await patchTopic(editingTopic.topicId, { newNodeName: newName });
      toast.success("토픽명이 수정되었습니다.");
    } catch {
      toast.error("수정에 실패했습니다.");
      setTopics(originalTopics); // 실패 시 롤백
    }
  };

  // 토픽 삭제 API 호출 핸들러
  const handleDelete = async (topicId: string) => {
    const originalTopics = useTopicStore.getState().topics; // 롤백을 위한 백업
    removeTopic(topicId); // 낙관적 업데이트
    try {
      await deleteTopic(topicId);
      toast.success("대화가 삭제되었습니다.");
      // 현재 보고 있는 토픽을 삭제한 경우 홈으로 이동
      if (window.location.pathname.includes(topicId)) {
        router.push("/");
      }
    } catch {
      toast.error("삭제에 실패했습니다.");
      setTopics(originalTopics); // 실패 시 롤백
    }
  };

  // 토픽 삭제 확인 핸들러
  const handleConfirmDelete = (topicId: string) => {
    if (window.confirm("정말로 이 대화를 삭제하시겠습니까?")) {
      handleDelete(topicId);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    toast.success("로그아웃 되었습니다.");
  };

  // --- 스타일 클래스 정의 ---

  // 사이드바 전체 스타일 (글래스모피즘 적용)
  const sidebarClass = cn(
    "ml-3 my-3 h-[calc(100vh-1.5rem)]",
    "w-[300px]",
    "rounded-[26px]",
    "border-0",
    "bg-white/60 dark:bg-black/60", // 반투명 배경
    "backdrop-blur-2xl", // 블러 효과
    "border border-white/40 dark:border-white/10", // 유리 테두리
    "shadow-2xl shadow-black/10", // 깊이감 있는 그림자
    "transition-all duration-500 ease-out" // 부드러운 전환 애니메이션
  );

  // 드롭다운 메뉴용 글래스모피즘 스타일
  const glassDropdownClass = cn(
    "bg-white/80 dark:bg-black/80 backdrop-blur-2xl",
    "border border-white/40 dark:border-white/10",
    "shadow-xl rounded-xl"
  );

  // 사이드바 메뉴 아이템 공통 스타일
  const itemClass = cn(
    "rounded-xl transition-all duration-200",
    "hover:bg-black/10 dark:hover:bg-white/20",
    "data-[active=true]:bg-black/15 dark:data-[active=true]:bg-white/25", // 활성 상태 스타일
    "data-[active=true]:font-medium"
  );

  return (
    <Sidebar collapsible="icon" className={sidebarClass}>
      {/* --- 사이드바 헤더 영역 --- */}
      <SidebarHeader className="p-4 pb-2 bg-transparent">
        {state === "expanded" ? (
          // 1. 펼친 상태: 로고, 텍스트, 접기 버튼 가로 배치
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 min-w-0 transition-opacity duration-300"
            >
              <div className="relative flex-shrink-0">
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
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 text-gray-500" />
          </div>
        ) : (
          // 2. 접힌 상태: 로고(크게), 펼치기 버튼, 새 채팅 버튼 세로 배치
          <div className="flex flex-col items-center gap-4 py-2">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center justify-center"
            >
              <Image
                src="/chatlogo.png"
                alt="Chat Logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
            </Link>

            {/* 펼치기 버튼 (강조된 스타일) */}
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

            {/* 새 채팅 버튼 (아이콘만 표시) */}
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

      {/* --- 사이드바 컨텐츠 영역 (스크롤 가능) --- */}
      <SidebarContent className="px-3 bg-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarMenu className="gap-2">
          {/* 검색 입력창 (펼친 상태에서만 표시) */}
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
          {/* '새 채팅 만들기' 메뉴 아이템 (펼친 상태에서만 표시) */}
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

        {/* 펼친 상태일 때만 구분선 및 목록 표시 */}
        {state === "expanded" && (
          <>
            <div className="my-4 px-2">
              <Separator className="bg-black/10 dark:bg-white/10" />
            </div>

            {/* 1. 즐겨찾기 목록 그룹 */}
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
                  {/* 접기/펼치기 아이콘 */}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isFavoriteListExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {/* 펼쳐진 상태일 때만 목록 내용 표시 */}
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

            {/* 2. 히스토리 또는 검색 결과 그룹 */}
            <SidebarGroup className="pt-0">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500/80 dark:text-gray-400/80 px-2 mb-2 uppercase tracking-wider">
                {searchTerm.trim() !== "" ? "Search Results" : "History"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {/* 스크롤 가능한 영역 설정 */}
                <ScrollArea className="h-[calc(100vh-20rem)] w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {loadingTopics ? (
                    // 로딩 중일 때 스켈레톤 UI 표시
                    <SidebarSkeleton />
                  ) : searchTerm.trim() !== "" ? (
                    // 검색어가 있을 때 검색 결과 목록 표시
                    <SearchResultsList
                      searchResults={searchResults}
                      itemClass={itemClass}
                    />
                  ) : nonFavoriteTopics.length > 0 ? (
                    // 검색어가 없고 히스토리가 있을 때 토픽 목록 표시
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
                    // 표시할 내용이 없을 때 안내 메시지
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

      {/* --- 사이드바 푸터 영역 (사용자 정보) --- */}
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