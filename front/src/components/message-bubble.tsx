"use client";

import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
// 'ReactMarkdown' 대신 'OptimisticAnswer'를 임포트합니다.
import { OptimisticAnswer } from "../components/enhanced-breadcrumb-focus-view/OptimisticAnswer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState } from "react";
import { Input } from "./ui/input";

interface MessageBubbleProps {
  questionText?: string;
  answer?: string; // string | null | undefined
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div
      className={`flex gap-3 p-4 ${
        isUser ? "bg-transparent" : "bg-gray-50"
      } group`}
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
      <div className="flex-1 space-y-2">
        {questionText &&
          (isEditing ? (
            <div className="space-y-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8"
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
            <div className="font-medium text-gray-900">{questionText}</div>
          ))}

        {/* --- 수정된 답변 렌더링 영역 --- */}
        {isAnswerVisible && (
          <div className="text-gray-700 leading-relaxed">
            {/* answer prop이 null/undefined/"" 이면 애니메이션을,
              실제 문자열이 있으면 ReactMarkdown을 렌더링합니다.
              isNew prop은 일단 false로 전달합니다. (필요시 조정)
            */}
            <OptimisticAnswer answer={answer} />
          </div>
        )}
        {/* --- 수정 완료 --- */}
        
      </div>
      {isUser && !isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
              <DropdownMenuItem onClick={onDelete}>삭제</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}