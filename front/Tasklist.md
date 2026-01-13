# Refactoring Checklist

## Naming Conventions (DX)
**Objective**: Ensure all filenames follow `kebab-case` for consistency.

- [x] Rename `DeleteConfirmationDialog.tsx` -> `delete-confirmation-dialog.tsx`
- [x] Rename `OptimisticAnswer.tsx` -> `optimistic-answer.tsx`
- [x] Rename `QuestionCard.tsx` -> `question-card.tsx`
- [x] Rename `QuestionTreeContext.tsx` -> `question-tree-context.tsx`
- [x] Rename `TopicSelectorModal.tsx` -> `topic-selector-modal.tsx`
- [x] Update imports in referencing files
- [x] Verify build (`npm run build`)

## DX Refactoring (No Structure Changes)
- [x] Extract Magic Numbers in `interactive-d3-graph.tsx`
- [x] Extract Magic Numbers in `app-sidebar.tsx`
- [x] Normalize Event Handler Props (`onClose`, `onConfirm`)
- [x] Fix Import Aliases (`../../` -> `@/`)
