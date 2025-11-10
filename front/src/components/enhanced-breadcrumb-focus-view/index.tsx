"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/message-bubble";
import { InteractiveD3Graph } from "@/components/interactive-d3-graph";
import { TopicTreeResponse } from "@/lib/data-transformer";

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
import { EditQuestionDialog } from "./edit-question-dialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import QuestionDetailModal from "../QuestionDetailModal";
import { findPathToNode } from "@/lib/utils";
import { AlertDialog } from "@radix-ui/react-alert-dialog";

interface EnhancedBreadcrumbFocusViewProps {
  initialResponse: TopicTreeResponse;
  initialQuestionId?: string | null; // Make it optional and nullable
}

export function EnhancedBreadcrumbFocusView({
  initialResponse,
  initialQuestionId,
}: EnhancedBreadcrumbFocusViewProps) {
  const topicId = initialResponse.topic; // Extract topicId here
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

function EnhancedBreadcrumbFocusViewContent({}: // initialResponse,
EnhancedBreadcrumbFocusViewProps) {
  const {
    viewData,
    currentPath,
    setCurrentPath,
    viewMode,
    editingQuestion,
    newQuestion,
    scrollAreaRef,
    currentQuestion,
    setViewMode,
    setEditingQuestion,
    setNewQuestion,
    navigateToQuestion,
    addToPath,
    handleGraphNodeClick,
    handleSaveEdit,
    handleSaveInPlaceEdit,
    handleDeleteQuestion,
    selectedNode,
    setSelectedNode,
    focusedNodeId,
    setFocusedNodeId,
    confirmReparenting,
    cancelModifyMode,
    reparentRequest,
  } = useQuestionTreeContext();

  const [isMainAnswerVisible, setIsMainAnswerVisible] = useState(true);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const requestDelete = (questionId: string) => {
    setQuestionToDelete(questionId);
  };

  const onConfirmDelete = () => {
    if (questionToDelete) {
      handleDeleteQuestion(questionToDelete);
      setQuestionToDelete(null);
    }
  };

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
            data={viewData} // Use viewData directly
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
                isUser={true} // Assuming the focused question is always by the user
                isToggleable={true}
                isAnswerVisible={isMainAnswerVisible}
                onToggleAnswer={() =>
                  setIsMainAnswerVisible(!isMainAnswerVisible)
                }
                onEdit={(newText) =>
                  handleSaveInPlaceEdit(currentQuestion.id, newText)
                }
                onDelete={() => requestDelete(currentQuestion.id)}
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
                key={currentQuestion.id} // Add key prop here
                questions={currentQuestion.children}
                addToPath={addToPath}
                onSave={handleSaveInPlaceEdit}
                onDelete={requestDelete}
                showTitle={currentPath.length > 1}
              />
            )}
          </div>
        </ScrollArea>
      </div>

      <NewQuestionForm />

      <EditQuestionDialog
        editingQuestion={editingQuestion}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        handleSaveEdit={handleSaveEdit}
        setEditingQuestion={setEditingQuestion}
      />

      <DeleteConfirmationDialog
        isOpen={questionToDelete !== null}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
