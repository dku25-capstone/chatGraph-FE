"use client";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const router = useRouter();
  const isRoot = true;

  const handleSend = async () => {
    console.log("전송");
    if (!input.trim()) return;

    // const topicId = "1";
    // const encoded = encodeURIComponent(input);

    // router.push(`/${topicId}?q=${encoded}`);

    try {
      const res = await axios.post("/ask-context", {
        isRoot,
        question: input,
      });

      const { topicId, questionId } = res.data;
      router.push(`/${topicId}?focus=${questionId}`);
    } catch (err) {
      console.error("질문 전송 실패", err);
    }
  };

  return (
    <div className="flex-1 h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-xl mb-4">무엇이든 질문하세요</h1>

      <div className="relative w-128">
        <Textarea
          className="w-full h-42 resize-none break-words p-4 pr-12 rounded-2xl border border-border"
          placeholder="여기에 질문을 입력하세요…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <Button
          size="icon"
          className="absolute bottom-2 right-2 rounded-full bg-primary text-white"
          aria-label="Send message"
          onClick={handleSend}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
