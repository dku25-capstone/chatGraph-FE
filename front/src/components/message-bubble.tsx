"use client";

import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimisticAnswer } from "../components/enhanced-breadcrumb-focus-view/OptimisticAnswer";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState, useEffect } from "react";
import { Textarea } from "./ui/textarea";

interface MessageBubbleProps {
  questionText?: string;
  answer?: string;
  isUser?: boolean;
  isToggleable?: boolean;
  isAnswerVisible?: boolean;
  onToggleAnswer?: () => void;
  onEdit?: (newText: string) => void;
  onDelete?: () => void;
}

export function MessageBubble({
  questionText = "",
  answer,
  isUser = false,
  isToggleable = false,
  isAnswerVisible = true,
  onToggleAnswer,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(questionText);

  useEffect(() => {
    setEditText(questionText);
  }, [questionText]);

  const handleSave = () => {
    if (onEdit) {
      onEdit(editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(questionText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className={`flex gap-3 p-4 ${
        isUser ? "bg-transparent justify-end" : "bg-gray-50"
      } group max-w-full`} // [추가] max-w-full로 전체 너비 제한
    >
      {isToggleable && onToggleAnswer && (
        <div className="flex-shrink-0 pt-1">
          <Button variant="ghost" size="sm" onClick={onToggleAnswer}>
            {isAnswerVisible ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      
      {/* [핵심 수정] w-full 추가: Flex 아이템이 가용 공간을 꽉 채우도록 강제 */}
      <div className="flex-1 min-w-0 w-full space-y-2">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                저장
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                취소
              </Button>
            </div>
          </div>
        ) : (
          // [핵심 수정] break-words 대신 break-all 사용 고려 (URL이나 긴 영어 단어 때문일 수 있음)
          // 만약 한글/일반 영어 문장 위주라면 break-words 유지,
          // 긴 문자열 테스트 중이라면 break-all을 사용하세요.
          <div className="font-medium text-gray-900 whitespace-pre-wrap break-words w-full">
            {questionText}
          </div>
        )}

        {isAnswerVisible && (
          // [핵심 수정] OptimisticAnswer를 감싸는 div에도 스타일 강제 적용
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full [&>*]:max-w-full [&>*]:break-words [&>*]:whitespace-pre-wrap">
             {/* [&>*]... 구문은 자식 요소(OptimisticAnswer 내부 태그)들에게도 강제로 줄바꿈 스타일을 주입합니다. */}
            <OptimisticAnswer answer={answer} />
          </div>
        )}
      </div>

      {isUser && !isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"> {/* flex-shrink-0 추가 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (onDelete) {
                    toast.warning("정말 이 질문을 삭제하시겠습니까?", {
                      action: {
                        label: "삭제",
                        onClick: () => onDelete(),
                      },
                      cancel: {
                        label: "취소",
                        onClick: () => toast.dismiss(),
                      },
                    });
                  }
                }}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}