"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { mockQuestionData, Question } from "@/lib/data"
import { EnhancedBreadcrumbFocusView } from "@/components/enhanced-breadcrumb-focus-view"

export default function EnhancedQuestionTreeApp() {
  const params = useParams()
  const { id } = params

  const [questionData, setQuestionData] = useState<Question | null>(null)

  useEffect(() => {
    console.log("Current ID from URL:", id)
    if (id) {
      const foundQuestion = mockQuestionData[id as string]
      console.log("Found question for ID:", foundQuestion)
      if (foundQuestion) {
        setQuestionData(foundQuestion)
      } else {
        console.error(`Question with ID ${id} not found. Falling back to root.`) // Updated error message
        setQuestionData(mockQuestionData["root"]) // Fallback to root
      }
    } else {
      console.log("No ID in URL, setting to root question.")
      setQuestionData(mockQuestionData["root"])
    }
  }, [id])

  if (!questionData) {
    return <div>Loading...</div> // Or a loading spinner
  }

  return (
    <div className="w-full h-screen">
      <EnhancedBreadcrumbFocusView data={questionData} onDataChange={setQuestionData} />
    </div>
  )
}
