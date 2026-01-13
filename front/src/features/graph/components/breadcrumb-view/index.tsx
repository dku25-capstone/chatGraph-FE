"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/features/chat/components/message-bubble";
import { InteractiveD3Graph } from "../interactive-d3-graph";
import { TopicTreeResponse } from "@/lib/data-transformer";
import { TopicSelectorModal } from "./topic-selector-modal";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  QuestionTreeProvider,
  useQuestionTreeContext,
} from "./question-tree-context";
import { FocusViewHeader } from "./focus-view-header";
import { SubQuestionList } from "./sub-question-list";
import { NewQuestionForm } from "./new-question-form";
import QuestionDetailModal from "@/features/chat/components/question-detail-modal";
import { findPathToNode, cn } from "@/lib/utils";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { useSidebar } from "@/components/ui/sidebar";
import { ShareEmailModal } from "@/features/share/components/share-email-modal";

interface EnhancedBreadcrumbFocusViewProps {
  initialResponse: TopicTreeResponse;
  initialQuestionId?: string | null;
}

export function EnhancedBreadcrumbFocusView({
  initialResponse,
  initialQuestionId,
}: EnhancedBreadcrumbFocusViewProps) {
  const topicId = initialResponse.topic;
  return (
    <QuestionTreeProvider
      initialResponse={initialResponse}
      topicId={topicId}
      initialQuestionId={initialQuestionId}
    >
      <EnhancedBreadcrumbFocusViewContent initialResponse={initialResponse} />
    </QuestionTreeProvider>
  );
}

function EnhancedBreadcrumbFocusViewContent({ }: EnhancedBreadcrumbFocusViewProps) {
  const { state, isMobile } = useSidebar();
  const {
    viewData,
    currentPath,
    setCurrentPath,
    viewMode,
    scrollAreaRef,
    currentQuestion,
    setViewMode,
    navigateToQuestion,
    addToPath,
    handleGraphNodeClick,
    handleSaveInPlaceEdit,
    handleDeleteQuestion,
    selectedNode,
    setSelectedNode,
    focusedNodeId,
    setFocusedNodeId,
    confirmReparenting,
    cancelModifyMode,
    reparentRequest,
    nodeToMove,
    isTopicSelectorOpen,
    setIsTopicSelectorOpen,
    moveToTopicRequest,
    setMoveTopicRequest,
    confirmMoveToOtherTopic,
    splitRequest,
    confirmSplitTopic,
    shareRequest,
    setShareRequest,
    confirmShare,
    toggleFavoriteQuestion,
  } = useQuestionTreeContext();

  const [isMainAnswerVisible, setIsMainAnswerVisible] = useState(true);

  useEffect(() => {
    if (viewMode === "chat" && focusedNodeId) {
      if (viewData && focusedNodeId) {
        const path = findPathToNode(viewData, focusedNodeId);
        if (path) {
          setCurrentPath(path);
        }
      }
      setFocusedNodeId(null);
    }
  }, [viewMode, focusedNodeId, viewData, setCurrentPath, setFocusedNodeId]);

  if (!currentQuestion || !viewData) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // 글래스 모피즘 스타일 정의 (통일성을 위해 변수로 관리)
  const glassmorphismAlertStyle =
    "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl";

  if (viewMode === "graph") {
    return (
      <div className="h-screen flex flex-col bg-white">
        <FocusViewHeader
          currentPath={currentPath}
          navigateToQuestion={navigateToQuestion}
        />
        <div className="flex-1 p-4">
          <InteractiveD3Graph
            data={viewData}
            onNodeClick={handleGraphNodeClick}
          />
          <QuestionDetailModal
            question={selectedNode}
            onClose={() => setSelectedNode(null)}
            onJumpToChat={() => {
              setFocusedNodeId(selectedNode?.id || null);
              setSelectedNode(null);
              setViewMode("chat");
            }}
          />
          <ShareEmailModal
            isOpen={!!shareRequest}
            onClose={() => setShareRequest(null)}
            onConfirm={(email) => confirmShare(email)}
          />

          {/* 1. 노드 이동 확인 Alert */}
          <AlertDialog
            open={!!reparentRequest}
            onOpenChange={(open) => {
              if (!open) {
                cancelModifyMode();
              }
            }}
          >
            <AlertDialogContent className={glassmorphismAlertStyle}>
              <AlertDialogHeader>
                <AlertDialogTitle>노드 이동 확인</AlertDialogTitle>
                <AlertDialogDescription>
                  <b>{reparentRequest?.movedNode.questionText}</b> 노드를
                  <br />
                  <b>{reparentRequest?.newParentNode.questionText}</b>의 하위
                  노드로 이동하시겠습니까?
                  <br />
                  <span className="text-xs text-muted-foreground">
                    (이 노드에 연결된 모든 하위 줄기가 함께 이동합니다.)
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelModifyMode}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmReparenting}>
                  이동
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* 2. 새 토픽으로 분리 Alert */}
          <AlertDialog
            open={!!splitRequest}
            onOpenChange={(open) => {
              if (!open) cancelModifyMode();
            }}
          >
            <AlertDialogContent className={glassmorphismAlertStyle}>
              <AlertDialogHeader>
                <AlertDialogTitle>새 토픽으로 분리</AlertDialogTitle>
                <AlertDialogDescription>
                  <b>{splitRequest?.nodeToSplit.questionText}</b> 질문과
                  <br />그 하위 줄기 전체를 <b>새로운 토픽</b>으로
                  분리하시겠습니까?
                  <br />
                  <span className="text-xs text-muted-foreground">
                    (현재 토픽에서는 해당 줄기가 삭제되고, 새 토픽 페이지로
                    이동합니다.)
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelModifyMode}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmSplitTopic}>
                  분리하기
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <TopicSelectorModal
            isOpen={isTopicSelectorOpen}
            onClose={cancelModifyMode}
            currentNodeToMove={nodeToMove}
            onNodeSelected={(targetTopic, targetParentNode) => {
              setIsTopicSelectorOpen(false);
              setMoveTopicRequest({
                movedNode: nodeToMove!,
                targetTopic: {
                  id: targetTopic.topicId,
                  name: targetTopic.topicName,
                },
                targetParentId: targetParentNode.id,
                targetParentNode: {
                  id: targetParentNode.id,
                  name: targetParentNode.name,
                },
              });
            }}
          />

          {/* 3. 다른 토픽으로 이동 확인 Alert */}
          <AlertDialog
            open={!!moveToTopicRequest}
            onOpenChange={(open) => {
              if (!open) setMoveTopicRequest(null);
            }}
          >
            <AlertDialogContent className={glassmorphismAlertStyle}>
              <AlertDialogHeader>
                <AlertDialogTitle>다른 토픽으로 이동 확인</AlertDialogTitle>
                <AlertDialogDescription>
                  <b>{moveToTopicRequest?.movedNode.questionText}</b> 질문
                  줄기를
                  <br />
                  <b>{moveToTopicRequest?.targetParentNode.name}</b> 하위로
                  이동하시겠습니까?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setMoveTopicRequest(null)}>
                  취소
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmMoveToOtherTopic}>
                  이동
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  return (
    // ... (나머지 리스트 뷰 코드는 동일)
    <div className="h-screen flex flex-col bg-white">
      {/* 1. 헤더 영역: 여기만 sticky 및 z-index 적용 */}
      <div className="sticky top-0 z-20">
        <FocusViewHeader
          currentPath={currentPath}
          navigateToQuestion={navigateToQuestion}
        />
        {/* MessageBubble 부분은 여기서 제거 */}
      </div>

      {/* 2. 스크롤 영역: 메시지 버블을 이 안으로 이동 */}
      <div className="relative flex-1 pb-[88px]">
        <ScrollArea className="absolute inset-0" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto p-4">
            {" "}
            {/* 패딩 추가 권장 */}
            {/* --- [이동됨] 메시지 버블 영역 시작 --- */}
            {currentPath.length > 1 && (
              <div className="mb-6">
                {" "}
                {/* 간격 추가 */}
                <MessageBubble
                  questionText={currentQuestion.questionText}
                  answer={currentQuestion.answerText}
                  isUser={true}
                  isToggleable={true}
                  isAnswerVisible={isMainAnswerVisible}
                  isFavorite={currentQuestion.favorite}
                  onToggleAnswer={() =>
                    setIsMainAnswerVisible(!isMainAnswerVisible)
                  }
                  onEdit={(newText) =>
                    handleSaveInPlaceEdit(currentQuestion.id, newText)
                  }
                  onDelete={() => handleDeleteQuestion(currentQuestion.id)}
                  onToggleFavorite={() =>
                    toggleFavoriteQuestion(currentQuestion.id)
                  }
                />
                <Separator className="my-4" />
              </div>
            )}
            {/* --- [이동됨] 메시지 버블 영역 끝 --- */}
            {currentQuestion.children.length > 0 && (
              <SubQuestionList
                key={currentQuestion.id}
                questions={currentQuestion.children}
                addToPath={addToPath}
                onSave={handleSaveInPlaceEdit}
                showTitle={currentPath.length > 1}
              />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 입력 폼 영역 (그대로 유지) */}
      <div
        className={cn(
          "fixed bottom-0 right-0 z-30",
          isMobile
            ? "left-0"
            : state === "expanded"
              ? "left-[16rem]"
              : "left-[3rem]"
        )}
      >
        <NewQuestionForm />
      </div>
    </div>
  );
}
