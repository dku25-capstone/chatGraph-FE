"use client";

import { SidebarMenu } from "@/components/ui/sidebar";
import { TopicHistoryItem } from "@/api/topics-history";
import { TopicListItem } from "./topic-list-item";

interface TopicListProps {
  topics: TopicHistoryItem[];
  editingTopic: TopicHistoryItem | null;
  editingNewName: string;
  glassDropdownClass: string;
  setEditingNewName: (name: string) => void;
  onStartEdit: (topic: TopicHistoryItem | null) => void;
  onConfirmEdit: () => void;
  onConfirmDelete: (topicId: string) => void;
  onToggleFavorite: (topicId: string) => void;
}

export function TopicList({
  topics,
  editingTopic,
  editingNewName,
  glassDropdownClass,
  setEditingNewName,
  onStartEdit,
  onConfirmEdit,
  onConfirmDelete,
  onToggleFavorite,
}: TopicListProps) {
  return (
    <SidebarMenu className="gap-1 w-full">
      {topics.map((item) => (
        <TopicListItem
          key={item.topicId}
          topic={item}
          isEditing={editingTopic?.topicId === item.topicId}
          onStartEdit={onStartEdit}
          onConfirmEdit={onConfirmEdit}
          onConfirmDelete={onConfirmDelete}
          onToggleFavorite={onToggleFavorite}
          editingNewName={editingNewName}
          setEditingNewName={setEditingNewName}
          glassDropdownClass={glassDropdownClass}
        />
      ))}
    </SidebarMenu>
  );
}
