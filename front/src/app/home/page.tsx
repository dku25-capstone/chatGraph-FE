import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export default function ChatInput() {
  return (
    <div className="flex-1 h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-xl mb-4">무엇이든 질문하세요</h1>

      <div className="relative w-128">
        <Textarea
          className="w-full h-42 resize-none break-words p-4 pr-12 rounded-2xl border border-border"
          placeholder="여기에 질문을 입력하세요…"
        />

        <Button
          size="icon"
          className="absolute bottom-2 right-2 rounded-full bg-primary text-white"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
