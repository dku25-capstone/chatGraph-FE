"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/message-bubble";
import { InteractiveD3Graph } from "@/components/interactive-d3-graph";
import { TopicTreeResponse } from "@/lib/data-transformer";
import { TopicSelectorModal } from "./TopicSelectorModal";

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
} from "./QuestionTreeContext";
import { FocusViewHeader } from "./focus-view-header";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { SubQuestionList } from "./sub-question-list";
import { NewQuestionForm } from "./new-question-form";
// <<< START: 질문 수정 방식 변경 (모달 -> 인라인) >>>
// EditQuestionDialog 컴포넌트는 더 이상 사용하지 않으므로 import 문 삭제
// import { EditQuestionDialog } from "./edit-question-dialog";
// <<< END: 질문 수정 방식 변경 (모달 -> 인라인) >>>
import QuestionDetailModal from "../QuestionDetailModal";
import { findPathToNode } from "@/lib/utils";
import { AlertDialog } from "@radix-ui/react-alert-dialog";

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

function EnhancedBreadcrumbFocusViewContent({}: EnhancedBreadcrumbFocusViewProps) {
  // <<< START: 질문 수정 방식 변경 (모달 -> 인라인) >>>
  // useQuestionTreeContext에서 모달 관련 상태 및 함수(editingQuestion, newQuestion 등) 제거
  // <<< END: 질문 수정 방식 변경 (모달 -> 인라인) >>>
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
    // setSplitRequest,
    confirmSplitTopic,
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

  if (viewMode === "graph") {
    return (
      <div className="h-screen flex flex-col bg-white">
        <FocusViewHeader />
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
          <AlertDialog
            open={!!reparentRequest}
            onOpenChange={(open) => {
              // 모달의 X 버튼이나 바깥쪽을 클릭해서 닫을 때
              if (!open) {
                cancelModifyMode();
              }
            }}
          >
            <AlertDialogContent>
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
                {/* "취소" 버튼에 cancelModifyMode 함수 연결 */}
                <AlertDialogCancel onClick={cancelModifyMode}>
                  취소
                </AlertDialogCancel>
                {/* "이동" 버튼에 confirmReparenting 함수 연결 */}
                <AlertDialogAction onClick={confirmReparenting}>
                  이동
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* ✅ 2. [추가] "새 토픽 분리" 확인 모달 */}
          <AlertDialog
            open={!!splitRequest}
            onOpenChange={(open) => {
              if (!open) cancelModifyMode(); // 닫으면 취소 처리
            }}
          >
            <AlertDialogContent>
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

          {/* 토픽 선택 모달 렌더링 */}
          <TopicSelectorModal
            isOpen={isTopicSelectorOpen}
            onClose={cancelModifyMode}
            currentNodeToMove={nodeToMove}
            onNodeSelected={(targetTopic, targetParentNode) => {
              // 토픽 선택 모달이 성공적으로 부모 노드를 선택했을때
              setIsTopicSelectorOpen(false); // 토픽 선택 모달 닫기
              setMoveTopicRequest({
                // 최종 확인 모달 띄우기
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

          {/* 다른 토픽으로 이동 최종 확인 모달 */}
          <AlertDialog
            open={!!moveToTopicRequest}
            onOpenChange={(open) => {
              if (!open) setMoveTopicRequest(null);
            }}
          >
            <AlertDialogContent>
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
    <div className="h-screen flex flex-col bg-white">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm">
        <FocusViewHeader />
        <BreadcrumbNavigation
          currentPath={currentPath}
          navigateToQuestion={navigateToQuestion}
        />
        <div className="max-w-4xl mx-auto">
          {currentPath.length > 1 && (
            <>
              <MessageBubble
                questionText={currentQuestion.questionText}
                answer={currentQuestion.answerText}
                isUser={true}
                isToggleable={true}
                isAnswerVisible={isMainAnswerVisible}
                onToggleAnswer={() =>
                  setIsMainAnswerVisible(!isMainAnswerVisible)
                }
                // <<< START: 질문 수정 방식 변경 (인라인) >>>
                // onEdit prop이 인라인 저장을 처리하는 handleSaveInPlaceEdit 함수를 호출하도록 변경.
                // 수정된 텍스트(newText)를 인자로 전달.
                onEdit={(newText) =>
                  handleSaveInPlaceEdit(currentQuestion.id, newText)
                }
                // <<< END: 질문 수정 방식 변경 (인라인) >>>
                onDelete={() => handleDeleteQuestion(currentQuestion.id)}
              />
              <Separator className="my-0" />
            </>
          )}
        </div>
      </div>

      <div className="relative flex-1">
        <ScrollArea className="absolute inset-0" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto">
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

      <NewQuestionForm />

      {/* <<< START: 질문 수정 방식 변경 (모달 -> 인라인) >>> */}
      {/* EditQuestionDialog 컴포넌트 렌더링 부분 삭제 */}
      {/* <<< END: 질문 수정 방식 변경 (모달 -> 인라인) >>> */}
    </div>
  );
}
