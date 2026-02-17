# PersonsPanel Mantine → Shadcn Migration Plan

## Phase 1: Header (`PersonHeader.tsx`) ✅ COMPLETE

- `Button` from @mantine/core → `Button` from `@bypass/ui`
- `Switch` from @mantine/core → `Switch` from `@bypass/ui`
- `LoadingOverlay` → `Spinner` from `@bypass/ui` (conditional render)
- `IoIosPersonAdd` → `UserAdd01Icon` (or similar) from `@hugeicons/core-free-icons`
- Convert CSS module to Tailwind
- **Delete**: `PersonHeader.module.css` ✅

## Phase 2: Persons Panel (`PersonsPanel.tsx`) ✅ COMPLETE

- `Flex` → `<div className="flex flex-col">`
- `Box` → `<div>`
- `notifications` from @mantine/notifications → `toast` from `sonner`
  - `notifications.show({ message })` → `toast.success(message)`
  - `notifications.show({ message, color: 'red' })` → `toast.error(message)`

### Additional Changes in Phase 2:

- `Persons.tsx` component: Migrated from Mantine to Tailwind
  - `Box` → `<div>`
  - `Flex` → `<div className="flex">`
  - Deleted `Persons.module.css` ✅
- `Person.tsx` component: Migrated from Mantine to Tailwind
  - `ActionIcon` → `Button` from `@bypass/ui`
  - `Avatar` → `Avatar` from `@bypass/ui`
  - `Flex` and `Text` → Tailwind classes
  - Deleted `Person.module.css` ✅

## Phase 3: Context Menu (`PersonVirtualCell.tsx`) ✅ COMPLETE

- **NO CHANGES** - Already uses migrated components + Hugeicons

## Phase 4: Add/Edit Person Modal (`AddOrEditPersonDialog.tsx`) ✅ COMPLETE

- `Modal` → `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from `@bypass/ui`
- `Stack` → `<div className="flex flex-col gap-4">`
- `Center` → `<div className="flex justify-center">`
- `Box` → `<div>` with Tailwind positioning
- `Avatar` → `Avatar`, `AvatarImage` from `@bypass/ui`
- `ActionIcon` → `Button` variant="ghost" with icon
- `TextInput` → `Input` + `Field`, `FieldLabel`, `FieldError` from `@bypass/ui`
- `Button` → `Button` from `@bypass/ui`
- `@mantine/form` → `@tanstack/react-form` + `zod`
- `AiFillEdit` → `PencilEdit01Icon` from `@hugeicons/core-free-icons`
- Convert CSS module to Tailwind
- **Delete**: `AddOrEditPersonDialog.module.css` ✅

## Phase 5: Image Upload Modal (`ImagePicker.tsx`) ✅ COMPLETE

- **Prerequisite**: Add Slider to @bypass/ui: `cd packages/ui && pnpm dlx shadcn@latest add slider` ✅
- `Modal` (fullScreen) → `Dialog` with full-screen styling ✅
- `Flex`, `Box`, `Group` → Tailwind flex/position classes ✅
- `Loader` → `Spinner` from `@bypass/ui` ✅
- `LoadingOverlay` → Custom overlay with `Spinner` ✅
- `TextInput` → `Input` from `@bypass/ui` ✅
- `Text` → Tailwind typography (`<span className="text-sm">`) ✅
- `Slider` → `Slider` from `@bypass/ui` (after adding) ✅
- `Button` → `Button` from `@bypass/ui` ✅
- `useDebouncedState` → Custom hook with `useState` + `useEffect` ✅
- Convert CSS module to Tailwind ✅
- **Delete**: `ImagePicker.module.css` ✅

## Phase 6: Bookmarks List Modal (`BookmarksList.tsx`) ✅ COMPLETE

- `Modal` (fullScreen) → `Dialog`, `DialogContent` from `@bypass/ui` (same pattern as ImagePicker) ✅
- `Avatar` → `Avatar`, `AvatarImage` from `@bypass/ui` ✅
- `Badge` → `Badge` from `@bypass/ui` ✅
  - `size="lg"` → removed, use default ✅
  - `size="sm"` → removed, use default ✅
  - `color="violet"` → `variant="secondary"` ✅
  - `radius="lg"` → default is rounded-4xl in shadcn ✅
- `ActionIcon` → `Button` with `variant="ghost"` size="icon" from `@bypass/ui` ✅
- `Box` → `<div>` with Tailwind classes ✅
- `Center` → `<div className="flex items-center justify-center">` ✅
- `Container` → `<div className="mx-auto max-w-2xl px-0">` ✅
- `AiFillEdit` → `PencilEdit01Icon` from `@hugeicons/core-free-icons` ✅
- `clsx` → removed, use template literals with Tailwind ✅
- Convert CSS module to Tailwind: ✅
  - `.header` → `contents max-sm:hidden` ✅
  - `.bookmarkContainer` → `relative flex w-full items-center justify-center rounded-md box-border cursor-pointer select-none hover:bg-muted` ✅
  - `.bookmarkWrapper` → `flex-1` ✅
- **Delete**: `BookmarksList.module.css` ✅

## Phase 7: Cleanup ✅ COMPLETE

- Remove all @mantine/\* imports from all Persons components ✅
- Delete `components/styles/` directory ✅
- Run `pnpm lint` ✅
- Run `pnpm typecheck:all` ✅

## Migration Complete! 🎉

All PersonsPanel components have been successfully migrated from Mantine to shadcn/ui.
