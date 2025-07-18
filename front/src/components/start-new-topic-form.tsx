"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { addQuestionTopic } from "@/lib/data"

export function StartNewTopicForm() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartNewTopic = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      // Simulate AI response for the initial question
      const initialAnswer = `This is the start of a new discussion about: "${prompt}". I'm ready to explore this topic with you.`
      const newId = `topic-${Date.now()}`

      const newTopic = {
        id: newId,
        question: prompt,
        answer: initialAnswer,
        timestamp: new Date().toISOString(),
        children: [],
      }

      addQuestionTopic(newTopic)

      router.push(`/${newId}`)
    } catch (error) {
      console.error("Error starting new topic:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Start a New Question Tree</h1>
        <p className="text-lg text-gray-600">
          Enter your initial question to begin a new topic and explore related concepts.
        </p>
        <div className="relative">
          <div className="flex items-end gap-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <Input
                placeholder="Type your first question here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault()
                    handleStartNewTopic()
                  }
                }}
                className="border-0 bg-transparent focus-visible:ring-0 text-lg py-3"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleStartNewTopic}
              disabled={!prompt.trim() || isLoading}
              size="lg"
              className="flex-shrink-0"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to start a new topic
          </p>
        </div>
      </div>
    </div>
  )
}
