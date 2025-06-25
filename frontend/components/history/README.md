# History Components

This directory contains the refactored components for the History page, which was previously a single large component.

## Components

### HistoryCard
- **File**: `HistoryCard.tsx`
- **Purpose**: Displays a single sheet music item in the history list
- **Props**:
  - `item`: The sheet music item data
  - `onEdit`: Callback for edit action
  - `onAnalyze`: Callback for analyze action
  - `onDelete`: Callback for delete action

### EmptyState
- **File**: `EmptyState.tsx`
- **Purpose**: Displays the empty state when no sheet music is available
- **Props**:
  - `onScanClick`: Callback for scan button click

### DeleteDialog
- **File**: `DeleteDialog.tsx`
- **Purpose**: Confirmation dialog for deleting sheet music
- **Props**:
  - `item`: The sheet music item to delete
  - `open`: Whether the dialog is open
  - `onOpenChange`: Callback for dialog open state change
  - `onConfirmDelete`: Callback for confirmed deletion

## Custom Hook

### useHistoryPage
- **File**: `../hooks/useHistoryPage.ts`
- **Purpose**: Manages all the state and business logic for the History page
- **Returns**: All necessary state and handler functions

## Benefits of Refactoring

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Easier to modify individual components without affecting others
4. **Testability**: Each component can be tested in isolation
5. **Readability**: Smaller, focused components are easier to understand
6. **Performance**: Potential for better memoization and optimization

## Usage

```tsx
import { HistoryCard, EmptyState, DeleteDialog } from "@/components/history";
import { useHistoryPage } from "@/hooks/useHistoryPage";

// In your component
const {
  sheetMusics,
  selectedItem,
  handleDeleteSheetMusic,
  handleEdit,
  handleAnalyze,
  handleScan,
  handleDeleteDialogOpen,
  handleDeleteDialogClose,
} = useHistoryPage();
```
