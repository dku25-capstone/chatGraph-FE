"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/message-bubble";
import { InteractiveD3Graph } from "@/components/interactive-d3-graph";
import {
  transformApiDataToViewData,
  TopicTreeResponse,
  ViewData,
} from "@/lib/data-transformer";

import { useQuestionTree } from "./use-question-tree";
import { FocusViewHeader } from "./focus-view-header";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { SubQuestionList } from "./sub-question-list";
import { NewQuestionForm } from "./new-question-form";
import { EditQuestionDialog } from "./edit-question-dialog";
import QuestionDetailModal from "../QuestionDetailModal";
import { findPathToNode } from "@/lib/utils";
import { getTopicById } from "@/api/questions";

interface EnhancedBreadcrumbFocusViewProps {
  initialResponse: TopicTreeResponse;
}

export function EnhancedBreadcrumbFocusView({
  initialResponse,
}: EnhancedBreadcrumbFocusViewProps) {
  const {
    viewData,
    currentPath,
    setCurrentPath,
    viewMode,
    prompt,
    isLoading,
    editingQuestion,
    newQuestion,
    newAnswer,
    scrollAreaRef,
    currentQuestion,
    setViewMode,
    setPrompt,
    setEditingQuestion,
    setNewQuestion,
    setNewAnswer,
    navigateToQuestion,
    addToPath,
    goHome,
    handleGraphNodeClick,
    handleAddQuestion,
    handleEditQuestion,
    handleSaveEdit,
    handleDeleteQuestion,
    selectedNode,
    setSelectedNode,
    focusedNodeId,
    setFocusedNodeId,
  } = useQuestionTree(initialResponse);

  const [isMainAnswerVisible, setIsMainAnswerVisible] = useState(true);

  const [graphData, setGraphData] = useState<ViewData | null>(null);

  useEffect(() => {
    setGraphData(viewData);
  }, [viewData]);

  const handleGraphViewClick = async () => {
    try {
      const topicId = initialResponse.topic;
      const updated = await getTopicById(topicId);
      setGraphData(transformApiDataToViewData(updated));
    } catch (e) {
      console.error("그래프 데이터 요청 실패", e);
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
        <FocusViewHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          goHome={goHome}
          pathLength={currentPath.length}
          onGraphViewClick={handleGraphViewClick}
        />
        <div className="flex-1 p-4">
          <InteractiveD3Graph
            data={graphData ?? viewData} // 항상 최신 viewData를 사용
            onNodeClick={handleGraphNodeClick}
            currentPath={currentPath}
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
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm">
        <FocusViewHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          goHome={goHome}
          pathLength={currentPath.length}
        />
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
                isToggleable={true}
                isAnswerVisible={isMainAnswerVisible}
                onToggleAnswer={() =>
                  setIsMainAnswerVisible(!isMainAnswerVisible)
                }
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
                handleEditQuestion={handleEditQuestion}
                handleDeleteQuestion={handleDeleteQuestion}
                showTitle={currentPath.length > 1}
              />
            )}
          </div>
        </ScrollArea>
      </div>

      <NewQuestionForm
        currentQuestion={currentQuestion}
        prompt={prompt}
        setPrompt={setPrompt}
        handleAddQuestion={handleAddQuestion}
        isLoading={isLoading}
      />

      <EditQuestionDialog
        editingQuestion={editingQuestion}
        newQuestion={newQuestion}
        newAnswer={newAnswer}
        setNewQuestion={setNewQuestion}
        setNewAnswer={setNewAnswer}
        handleSaveEdit={handleSaveEdit}
        setEditingQuestion={setEditingQuestion}
      />
    </div>
  );
}
