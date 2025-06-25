# Editor Components

This directory contains the refactored components for the sheet music editor. The original monolithic `EditorPage` component has been broken down into smaller, more maintainable components.

## Structure

### Hook
- **`useEditor.ts`** - Custom hook that manages all the editor state and logic

### Components

#### Core Components
- **`EditorHeader.tsx`** - Header with title, page info, and action buttons
- **`EditorCanvas.tsx`** - Main canvas area for displaying and editing sheet music
- **`EmptyState.tsx`** - Component shown when no sheet music is selected

#### Sidebar Components
- **`PagesSidebar.tsx`** - Left sidebar for page navigation and management
- **`AnnotationsSidebar.tsx`** - Right sidebar for viewing and editing annotations

#### Annotation Components
- **`AnnotationInput.tsx`** - Input component for creating new annotations
- **`AnnotationOverlay.tsx`** - Overlay component for displaying annotations on the canvas

## Benefits of Refactoring

### 1. **Separation of Concerns**
- Each component has a single responsibility
- Business logic is separated from UI components
- State management is centralized in the custom hook

### 2. **Improved Maintainability**
- Smaller, focused components are easier to understand and modify
- Changes to one component don't affect others
- Easier to write tests for individual components

### 3. **Better Reusability**
- Components can be easily reused in other parts of the application
- Hook can be reused with different UI implementations
- Individual components can be replaced or customized

### 4. **Enhanced Developer Experience**
- Clearer code structure makes it easier for new developers to understand
- Better IDE support with smaller files
- Easier debugging and troubleshooting

## Usage

```tsx
import { useEditor } from "@/hooks/useEditor";
import {
  PagesSidebar,
  EditorCanvas,
  AnnotationsSidebar,
  EditorHeader,
  EmptyState,
} from "@/components/editor";

export default function EditorPage() {
  const editor = useEditor(sheetMusicId);
  
  if (!editor.currentSheetMusic) {
    return <EmptyState onScanNew={handleScanNew} />;
  }

  return (
    <div>
      <EditorHeader {...headerProps} />
      <div className="grid grid-cols-12 gap-4">
        <PagesSidebar {...pagesProps} />
        <EditorCanvas {...canvasProps} />
        <AnnotationsSidebar {...annotationsProps} />
      </div>
    </div>
  );
}
```

## Component Props

Each component is fully typed with TypeScript interfaces that define the required props. Refer to the individual component files for detailed prop definitions.

## State Management

All state management is handled by the `useEditor` hook, which:
- Manages UI state (zoom, tool selection, sidebar visibility)
- Handles sheet music operations (page navigation, annotation management)
- Provides event handlers for all user interactions
- Integrates with the global sheet music store

This centralized approach makes it easy to understand the data flow and debug issues.
