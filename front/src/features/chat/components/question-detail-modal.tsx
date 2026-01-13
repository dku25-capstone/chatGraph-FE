// components/enhanced-breadcrumb-focus-view/QuestionDetailModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ViewData } from "@/lib/data-transformer";
import { QuestionCard } from "@/features/graph/components/breadcrumb-view/question-card";

interface QuestionDetailModalProps {
  question: ViewData | null;
  onClose: () => void;
  onJumpToChat: () => void;
}

export default function QuestionDetailModal({
  question,
  onClose,
  onJumpToChat,
}: QuestionDetailModalProps) {
  return (
    <Dialog open={!!question} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-4xl p-0 bg-transparent border-none shadow-none overflow-hidden">
        {/* 모달의 기본 스타일을 제거하고 내부 컨테이너에서 스타일을 재정의합니다.
          이렇게 하면 카드 주변의 여백이나 배경색 문제를 해결하기 쉽습니다.
        */}
        <div className="bg-white dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>질문 상세</DialogTitle>
          </DialogHeader>

          {/* 스크롤 영역: 카드가 길어지면 이 영역 내에서 스크롤됩니다.
            p-6 클래스로 카드 주변에 여백을 줍니다.
          */}
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {question && (
              <QuestionCard
                question={question}
                isModalMode={true} // 모달 모드 활성화 (클릭 네비게이션 방지)
                defaultAnswerExpanded={true} // 상세 모달이니 답변은 기본적으로 펼쳐둡니다 (사용자가 접을 수 있음)
              />
            )}
          </div>

          {/* 하단 버튼 영역 */}
          <div className="p-6 pt-2 flex justify-end gap-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-lg">
            <Button onClick={onJumpToChat} variant="default">
              질문 페이지로 이동
            </Button>
            <Button onClick={onClose} variant="outline">
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}