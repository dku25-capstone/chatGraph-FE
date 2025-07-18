"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, MessageSquare, Network, Edit, Trash2, Home, List, ArrowUp, Bot, User, Eye } from "lucide-react"

import { mockQuestionData, Question } from "@/lib/data"
import { MessageBubble } from "@/components/message-bubble"
import { InteractiveD3Graph } from "@/components/interactive-d3-graph"

interface EnhancedBreadcrumbFocusViewProps {
  data: Question
  onDataChange: (newData: Question) => void
}

export function EnhancedBreadcrumbFocusView({
  data,
  onDataChange,
}: EnhancedBreadcrumbFocusViewProps) {
  const [currentPath, setCurrentPath] = useState<Question[]>([data])
  const [viewMode, setViewMode] = useState<"chat" | "graph">("chat")
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const currentQuestion = currentPath[currentPath.length - 1]

  // Simulate AI response
  const simulateAIResponse = useCallback(async (prompt: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const responses = [
      `Great question about "${prompt}". This is a fascinating topic that involves multiple interconnected concepts. Let me break this down for you with detailed explanations and practical examples.`,
      `Excellent inquiry regarding "${prompt}". This subject has been extensively researched and has significant implications across various domains. Here's a comprehensive overview of the key aspects.`,
      `That's a thoughtful question about "${prompt}". Understanding this concept requires examining both theoretical foundations and real-world applications. Let me provide you with a thorough explanation.`,
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }, [])

  // Navigation functions
  const navigateToQuestion = useCallback(
    (question: Question, pathIndex: number) => {
      setCurrentPath(currentPath.slice(0, pathIndex + 1))
    },
    [currentPath],
  )

  const addToPath = useCallback(
    (question: Question) => {
      setCurrentPath([...currentPath, question])
    },
    [currentPath],
  )

  const goHome = useCallback(() => {
    setCurrentPath([data])
  }, [data])

  // Find question by ID
  const findQuestionById = useCallback((id: string): Question | null => {
    return mockQuestionData[id] || null
  }, [])

  // Find path to question
  const findPathToQuestion = useCallback(
    (root: Question, targetId: string, path: Question[] = []): Question[] | null => {
      const currentPath = [...path, root]
      if (root.id === targetId) return currentPath

      for (const child of root.children) {
        const result = findPathToQuestion(child, targetId, currentPath)
        if (result) return result
      }
      return null
    },
    [],
  )

  // Handle graph node click
  const handleGraphNodeClick = useCallback(
    (question: Question) => {
      const path = findPathToQuestion(data, question.id)
      if (path) {
        setCurrentPath(path)
        setViewMode("chat")
      }
    },
    [data, findPathToQuestion],
  )

  // Add new question
  const handleAddQuestion = useCallback(async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const answer = await simulateAIResponse(prompt)
      const newId = `${currentQuestion.id}-${Date.now()}`

      const newQuestionObj: Question = {
        id: newId,
        question: prompt,
        answer: answer,
        timestamp: new Date().toISOString(),
        children: [],
      }

      // Update data
      const updateData = (root: Question): Question => {
        if (root.id === currentQuestion.id) {
          return {
            ...root,
            children: [...root.children, newQuestionObj],
          }
        }
        return {
          ...root,
          children: root.children.map(updateData),
        }
      }

      const updatedData = updateData(data)
      onDataChange(updatedData)

      // Update current path
      const updatedCurrentQuestion = findQuestionById(currentQuestion.id)
      if (updatedCurrentQuestion) {
        const newPath = [...currentPath.slice(0, -1), updatedCurrentQuestion]
        setCurrentPath(newPath)
      }

      setPrompt("")

      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    } catch (error) {
      console.error("Error adding question:", error)
    } finally {
      setIsLoading(false)
    }
  }, [prompt, currentQuestion, data, onDataChange, findQuestionById, currentPath, simulateAIResponse])

  // Handle edit question
  const handleEditQuestion = useCallback((question: Question) => {
    setEditingQuestion(question)
    setNewQuestion(question.question)
    setNewAnswer(question.answer)
  }, [])

  // Save edit
  const handleSaveEdit = useCallback(() => {
    if (!editingQuestion) return

    const updateData = (root: Question): Question => {
      if (root.id === editingQuestion.id) {
        return {
          ...root,
          question: newQuestion,
          answer: newAnswer,
        }
      }
      return {
        ...root,
        children: root.children.map(updateData),
      }
    }

    const updatedData = updateData(data)
    onDataChange(updatedData)

    // Update current path
    const updatedPath = currentPath.map((q) =>
      q.id === editingQuestion.id ? { ...q, question: newQuestion, answer: newAnswer } : q,
    )
    setCurrentPath(updatedPath)

    setEditingQuestion(null)
    setNewQuestion("")
    setNewAnswer("")
  }, [editingQuestion, newQuestion, newAnswer, data, onDataChange, currentPath])

  // Delete question
  const handleDeleteQuestion = useCallback(
    (questionId: string) => {
      const updateData = (root: Question): Question => {
        return {
          ...root,
          children: root.children.filter((child) => child.id !== questionId).map(updateData),
        }
      }

      const updatedData = updateData(data)
      onDataChange(updatedData)

      // Update path if deleted question is in current path
      const deletedIndex = currentPath.findIndex((q) => q.id === questionId)
      if (deletedIndex !== -1) {
        setCurrentPath(currentPath.slice(0, deletedIndex))
      }
    },
    [data, onDataChange, currentPath],
  )

  if (viewMode === "graph") {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Top Navigation */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setViewMode("chat")}>
              <List className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
            <h1 className="text-xl font-semibold">Question Tree Graph</h1>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {currentPath.length} levels deep
          </Badge>
        </div>

        {/* Graph View */}
        <div className="flex-1 p-4">
          <InteractiveD3Graph data={data} onNodeClick={handleGraphNodeClick} currentPath={currentPath} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={goHome}>
            <Home className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setViewMode("graph")}>
            <Network className="h-4 w-4 mr-2" />
            View as Graph
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            Level {currentPath.length}
          </Badge>
        </div>
      </div>

      {/* Enhanced Breadcrumb Navigation */}
      <div className="px-4 py-3 bg-gray-50 border-b">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 min-w-max">
            {currentPath.map((question, index) => (
              <div key={question.id} className="flex items-center gap-2">
                <Button
                  variant={index === currentPath.length - 1 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigateToQuestion(question, index)}
                  className="max-w-[200px] truncate text-xs"
                >
                  {question.question}
                </Button>
                {index < currentPath.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto">
          {/* Current Question and Answer */}
          <MessageBubble question={currentQuestion.question} answer={currentQuestion.answer} />

          <Separator className="my-4" />

          {/* Sub-questions */}
          {currentQuestion.children.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Related Questions ({currentQuestion.children.length})
              </h3>
              <div className="grid gap-3">
                {currentQuestion.children.map((child) => (
                  <Card
                    key={child.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1" onClick={() => addToPath(child)}>
                          <h4 className="font-medium text-blue-600 hover:text-blue-800 mb-2">{child.question}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{child.answer}</p>
                          <div className="flex items-center gap-2">
                            {child.children.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {child.children.length} sub-questions
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {new Date(child.timestamp).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditQuestion(child)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteQuestion(child.id)
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => addToPath(child)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ChatGPT-style Input Area */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex items-end gap-3 p-3 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <Input
                  placeholder={`Ask a follow-up question about "${currentQuestion.question.substring(0, 50)}${currentQuestion.question.length > 50 ? "..." : ""}"`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                      e.preventDefault()
                      handleAddQuestion()
                    }
                  }}
                  className="border-0 bg-transparent focus-visible:ring-0 text-sm"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleAddQuestion}
                disabled={!prompt.trim() || isLoading}
                size="sm"
                className="flex-shrink-0"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • This will create a sub-question under the current topic
            </p>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question & Answer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Question</label>
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Answer</label>
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Enter the answer"n                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
