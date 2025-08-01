"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/message-bubble";
import { InteractiveD3Graph } from "@/components/interactive-d3-graph";
import { TopicTreeResponse } from "@/lib/data-transformer";

import { useQuestionTree } from "./use-question-tree";
import { FocusViewHeader } from "./focus-view-header";
import { BreadcrumbNavigation } from "./breadcrumb-navigation";
import { SubQuestionList } from "./sub-question-list";
import { NewQuestionForm } from "./new-question-form";
import { EditQuestionDialog } from "./edit-question-dialog";

interface EnhancedBreadcrumbFocusViewProps {
  initialResponse: TopicTreeResponse;
  onDataChange: (newResponse: TopicTreeResponse) => void;
}

export function EnhancedBreadcrumbFocusView({
  initialResponse,
  onDataChange,
}: EnhancedBreadcrumbFocusViewProps) {
  const {
    currentPath,
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
  } = useQuestionTree(initialResponse, onDataChange);

  const [isMainAnswerVisible, setIsMainAnswerVisible] = useState(true);

  if (!currentQuestion) {
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
        />
        <div className="flex-1 p-4">
          <InteractiveD3Graph
            data={initialResponse}
            onNodeClick={handleGraphNodeClick}
            currentPath={currentPath}
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
                question={currentQuestion.question}
                answer={currentQuestion.answer}
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
