"use client";

import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
// 'ReactMarkdown' 대신 'OptimisticAnswer'를 임포트합니다.
import { OptimisticAnswer } from "../components/enhanced-breadcrumb-focus-view/OptimisticAnswer";
// <<< START: 삭제 확인 기능 추가 >>>
// sonner 라이브러리에서 toast 함수를 임포트하여 확인 창을 띄우는 데 사용.
import { toast } from "sonner";
// <<< END: 삭제 확인 기능 추가 >>>
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// <<< START: 질문 수정 방식 변경 (인라인) >>>
// 인라인 수정을 위해 useState와 useEffect를 임포트.
import React, { useState, useEffect } from "react";
// Input 대신 여러 줄 입력이 가능한 Textarea를 사용.
import { Textarea } from "./ui/textarea";
// <<< END: 질문 수정 방식 변경 (인라인) >>>

interface MessageBubbleProps {
  questionText?: string;
  answer?: string; // string | null | undefined
  isUser?: boolean;
  isToggleable?: boolean;
  isAnswerVisible?: boolean;
  onToggleAnswer?: () => void;
  // <<< START: 질문 수정 방식 변경 (인라인) >>>
  // onEdit prop의 타입을 수정된 텍스트를 인자로 받는 함수로 변경.
  onEdit?: (newText: string) => void;
  // <<< END: 질문 수정 방식 변경 (인라인) >>>
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
  // <<< START: 질문 수정 방식 변경 (인라인) >>>
  // 인라인 수정을 위한 내부 상태. isEditing은 수정 모드 여부, editText는 수정 중인 텍스트.
      const [isEditing, setIsEditing] = useState(false);
      const [editText, setEditText] = useState(questionText);
    
      useEffect(() => {
        setEditText(questionText);
      }, [questionText]);  // '저장' 버튼 클릭 시 호출. onEdit prop을 통해 변경된 텍스트를 상위로 전달.
  const handleSave = () => {
    if (onEdit) {
      onEdit(editText);
    }
    setIsEditing(false);
  };

  // '취소' 버튼 클릭 시 호출. 수정 상태를 해제하고 텍스트를 원본으로 되돌림.
  const handleCancel = () => {
    setIsEditing(false);
    setEditText(questionText);
  };

  // Textarea에서 키보드 입력 처리. Shift+Enter가 아닌 Enter키만 눌렀을 때 저장.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };
  // <<< END: 질문 수정 방식 변경 (인라인) >>>

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
          <div className="font-medium text-gray-900">{questionText}</div>
        )}

        {/* 답변 렌더링 영역 */}
        {isAnswerVisible && (
          <div className="text-gray-700 leading-relaxed">
            <OptimisticAnswer answer={answer} />
          </div>
        )}
      </div>
      {/* isEditing이 아닐 때만 수정/삭제 메뉴가 보이도록 함 */}
      {isUser && !isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* <<< START: 질문 수정 방식 변경 (인라인) >>> */}
              {/* '수정' 버튼 클릭 시 isEditing 상태를 true로 변경하여 인라인 수정 모드로 진입 */}
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                수정
              </DropdownMenuItem>
              {/* <<< END: 질문 수정 방식 변경 (인라인) >>> */}

              {/* <<< START: 삭제 확인 기능 추가 >>> */}
              {/* '삭제' 버튼 클릭 시 바로 onDelete를 호출하는 대신, 확인 토스트를 띄움 */}
              <DropdownMenuItem
                onClick={() => {
                  if (onDelete) {
                    toast.warning("정말 이 질문을 삭제하시겠습니까?", {
                      action: {
                        label: "삭제",
                        onClick: () => onDelete(), // 사용자가 '삭제'를 눌러야만 실제 삭제 함수 호출
                      },
                      cancel: {
                        label: "취소",
                        onClick: () => toast.dismiss(), // 취소 버튼 클릭 시 토스트 닫기
                      },
                    });
                  }
                }}
              >
                삭제
              </DropdownMenuItem>
              {/* <<< END: 삭제 확인 기능 추가 >>> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
