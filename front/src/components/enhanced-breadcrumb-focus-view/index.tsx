"use client"

import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "@/components/message-bubble"
import { InteractiveD3Graph } from "@/components/interactive-d3-graph"
import { Question } from "@/lib/data"

import { useQuestionTree } from "./use-question-tree";
import { FocusViewHeader } from "./FocusViewHeader";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { SubQuestionList } from "./SubQuestionList";
import { NewQuestionForm } from "./NewQuestionForm";
import { EditQuestionDialog } from "./EditQuestionDialog";

interface EnhancedBreadcrumbFocusViewProps {
  data: Question
  onDataChange: (newData: Question) => void
}

export function EnhancedBreadcrumbFocusView({ data, onDataChange }: EnhancedBreadcrumbFocusViewProps) {
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
  } = useQuestionTree(data, onDataChange);

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
          <InteractiveD3Graph data={data} onNodeClick={handleGraphNodeClick} currentPath={currentPath} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <FocusViewHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        goHome={goHome}
        pathLength={currentPath.length}
      />
      <BreadcrumbNavigation currentPath={currentPath} navigateToQuestion={navigateToQuestion} />

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto">
          <MessageBubble question={currentQuestion.question} answer={currentQuestion.answer} />
          <Separator className="my-4" />
          {currentQuestion.children.length > 0 && (
            <SubQuestionList
              questions={currentQuestion.children}
              addToPath={addToPath}
              handleEditQuestion={handleEditQuestion}
              handleDeleteQuestion={handleDeleteQuestion}
            />
          )}
        </div>
      </ScrollArea>

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
  )
}