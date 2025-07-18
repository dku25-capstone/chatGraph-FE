import { Bot, User } from "lucide-react"

interface MessageBubbleProps {
  question?: string
  answer?: string
  isUser?: boolean
}

export function MessageBubble({
  question,
  answer,
  isUser = false,
}: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 p-4 ${isUser ? "bg-transparent" : "bg-gray-50"}`}>
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-blue-600" : "bg-green-600"}`}
        >
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {question && <div className="font-medium text-gray-900">{question}</div>}
        {answer && <div className="text-gray-700 leading-relaxed">{answer}</div>}
      </div>
    </div>
  )
}
