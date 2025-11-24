"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuItem, SidebarInput } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MoreVertical, Check } from "lucide-react";
import { TopicHistoryItem } from "@/api/topics-history";

interface TopicListItemProps {
  topic: TopicHistoryItem;
  isEditing: boolean;
  onStartEdit: (topic: TopicHistoryItem) => void;
  onConfirmEdit: () => void;
  onConfirmDelete: (topicId: string) => void;
  editingNewName: string;
  setEditingNewName: (name: string) => void;
  glassDropdownClass: string;
}

export function TopicListItem({
  topic,
  isEditing,
  onStartEdit,
  onConfirmEdit,
  onConfirmDelete,
  editingNewName,
  setEditingNewName,
  glassDropdownClass,
}: TopicListItemProps) {
  const displayName =
    topic.topicName.length > 12
      ? `${topic.topicName.substring(0, 12)}...`
      : topic.topicName;

  return (
    <SidebarMenuItem
      key={topic.topicId}
      className="group relative flex items-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
    >
      {isEditing ? (
        <div className="flex items-center gap-2 w-full p-1">
          <SidebarInput
            autoFocus
            value={editingNewName}
            onChange={(e) => setEditingNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirmEdit();
              else if (e.key === "Escape") onStartEdit(null as any); // Cancel editing
            }}
            className="h-8 text-sm bg-white/50 dark:bg-black/50 rounded-md border-none px-2 shadow-inner min-w-0 flex-1"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={onConfirmEdit}
            className="h-8 w-8 shrink-0 rounded-md hover:bg-green-500/20 hover:text-green-600"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <Link
            href={`/${topic.topicId}`}
            title={topic.topicName}
            className="block w-full min-w-0 py-2 px-3 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white"
          >
            {displayName}
          </Link>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              asChild
              className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/20 text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent
                side="right"
                align="start"
                className={glassDropdownClass}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit(topic);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <span>수정하기</span>
                </DropdownMenuItem>
                <Separator className="bg-black/5 dark:bg-white/5 my-1" />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmDelete(topic.topicId);
                  }}
                  className="text-red-500 focus:text-red-600 cursor-pointer gap-2 focus:bg-red-50 dark:focus:bg-red-950/30"
                >
                  <span>삭제하기</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </>
      )}
    </SidebarMenuItem>
  );
}
