"use client";

import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

// This type might need to be imported from a central types file in a real app
interface SearchResultNode {
  topicId: string;
  questionId: string;
  questionText: string;
}

interface SearchResultsListProps {
  searchResults: SearchResultNode[];
  itemClass: string;
}

export function SearchResultsList({
  searchResults,
  itemClass,
}: SearchResultsListProps) {
  return (
    <SidebarMenu className="gap-1">
      {searchResults.map((item) => (
        <SidebarMenuItem key={item.questionId}>
          <SidebarMenuButton asChild className={itemClass}>
            <Link href={`/${item.topicId}?question=${item.questionId}`}>
              <span className="truncate text-sm">{item.questionText}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
