"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
}

export function ShareEmailModal({
  isOpen,
  onClose,
  onConfirm,
}: ShareEmailModalProps) {
  const [email, setEmail] = useState("");

  const handleShare = () => {
    if (email.trim()) {
      onConfirm(email);
      setEmail(""); // 초기화
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>그래프 공유하기</DialogTitle>
          <DialogDescription>
            선택한 노드 줄기를 공유할 상대방의 이메일을 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              이메일
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleShare}>공유</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
