# BookmarksPanel Mantine to Shadcn Migration Plan

## Overview

Phase-wise migration plan to migrate `BookmarksPanel` from Mantine to Shadcn components.

---

## Phase 1: Header ✅ COMPLETE

**Components migrated:**

- `BookmarksHeader.tsx` - Migrated to use Button from @bypass/ui and ahooks
- `Header` (from @bypass/shared) - Migrated to use Button and Badge from @bypass/ui
- `ConfirmationDialog.tsx` - Migrated to use Dialog and Button from @bypass/ui
- `Search.tsx` (from @bypass/shared) - Migrated to use InputGroup from @bypass/ui and ahooks

**Installed:**

- `badge`, `dialog`, `input`, `input-group`, `label`, `textarea` shadcn components
- `ahooks` npm package

---

## Phase 2: Bookmarks in Bookmarks List

**Components to migrate:**

- `BookmarkRow.tsx` - Wraps shared Bookmark component
- `Bookmark` (from @bypass/shared) - Uses Flex, Text, Tooltip
- `PersonAvatars` (from @bypass/shared) - Uses Avatar, HoverCard, Tooltip
- `VirtualRow.tsx` - Uses Box
- `BookmarksPanel.tsx` - Uses Box, Flex for layout

**Installations:**

```bash
cd packages/ui
pnpm dlx shadcn@latest add hover-card
```

---

## Phase 3: Folders in Bookmarks List

**Components to migrate:**

- `FolderRow.tsx` - Uses Box, Flex, useMantineTheme
- `Folder` (from @bypass/shared) - Uses Center, Text
- Folder styling with star icon for default folders

**Installations:**

```bash
# No new installations needed
```

---

## Phase 4: Context Menu

**Components to migrate:**

- `ContextMenu.tsx` (shared component) - Uses Box, useMantineTheme, mantine-contextmenu
- `BookmarkContextMenu.tsx` - Uses useHotkeys, useMantineTheme
- Replace mantine-contextmenu library

**Installations:**

```bash
cd packages/ui
pnpm dlx shadcn@latest add dropdown-menu
```

---

## Phase 5: Scroll Buttons

**Components to migrate:**

- `ScrollButton` (from @bypass/shared) - Uses Button
- Scroll navigation functionality

**Installations:**

```bash
# No new installations needed - button already available
```

---

## Phase 6: Add/Edit Bookmarks Modal

**Components to migrate:**

- `BookmarkAddEditDialog.tsx` - Uses Modal, TextInput, Select, Stack, Button, useForm
- `PersonSelect.tsx` - Uses MultiSelect, Avatar, Switch, Flex, Text
- Replace @mantine/form with TanStack Form

**Installations:**

```bash
pnpm add @tanstack/react-form

cd packages/ui
pnpm dlx shadcn@latest add field
pnpm dlx shadcn@latest add select
```

---

## Phase 7: Add/Edit Folders Modal

**Components to migrate:**

- `FolderAddEditDialog.tsx` - Uses Modal, TextInput, Button, Group
- Replace @mantine/form with TanStack Form

**Installations:**

```bash
# No new installations needed - @tanstack/react-form and field added in Phase 6
```

---

## Phase 8: Cleanup & Remaining Tasks

**Remaining components & tasks:**

- Replace `@mantine/notifications` in `useBookmarkStore.ts` with Sonner
- Remove CSS modules and convert to Tailwind:
  - `BookmarksPanel.module.css`
  - `FolderRow.module.css`
  - `VirtualRow.module.css`
- Remove `useMantineTheme` usage throughout
- Run lint, typecheck, and E2E tests

**Installations:**

```bash
# No new installations needed
```

---

## Summary of All Installations

**Via shadcn CLI:**

- `badge`
- `dialog`
- `input`
- `input-group`
- `label`
- `textarea`
- `hover-card`
- `dropdown-menu`
- `select`
- `field`

**Via npm:**

- `ahooks`
- `@tanstack/react-form`

**Already Available:**

- `button` ✓
- `tooltip` ✓
- `switch` ✓
- `avatar` ✓
- `sonner` ✓
- `zod` ✓
- Tailwind CSS v4 ✓
