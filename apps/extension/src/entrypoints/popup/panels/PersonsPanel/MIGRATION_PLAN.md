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

## Phase 6: Cleanup

- Remove all @mantine/\* imports
- Delete `components/styles/` directory
- Run `pnpm lint` && `pnpm typecheck:all`
