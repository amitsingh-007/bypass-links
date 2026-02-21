# Web App Mantine to ShadCN Migration Plan

## Overview

This document outlines the phase-wise migration plan for converting the web app from Mantine to ShadCN (base-ui), following the same patterns used in the extension app migration.

## Key Patterns from Extension App

Based on the extension app implementation:

- Uses `@bypass/ui` + Tailwind utility classes (no Mantine runtime styling)
- Imports `@bypass/ui/styles/globals.css` at app entry
- Forces dark mode via static HTML class (`<html class="dark">`), not `next-themes`
- Uses Hugeicons (`@hugeicons/react` + `@hugeicons/core-free-icons`) across migrated UI
- Uses shadcn/base-ui primitives from `@bypass/ui` (e.g., `Button`, `Switch`, `TooltipProvider`)
- No CSS modules - all styling via Tailwind classes

## Infrastructure Differences

- **Extension (Vite)**: Uses `@tailwindcss/vite` plugin
- **Web (Next.js)**: Uses `@tailwindcss/postcss` plugin (standard for Next.js + Tailwind v4)

---

## Phase 0: Infrastructure Setup ✅ COMPLETED

### Dependencies Added (`apps/web/package.json`)

- `@bypass/ui`: "workspace:\*"
- `@base-ui/react`: "1.1.0"
- `tailwindcss`: "4.1.18"
- `@tailwindcss/postcss`: "4.1.18"
- `@hugeicons/react`: "1.1.5"
- `@hugeicons/core-free-icons`: "3.1.1"

### Dependencies to Remove (in Phase 4)

- `@mantine/core`
- `@mantine/hooks`
- `postcss-preset-mantine`
- `postcss-simple-vars`

### Files Modified

#### 1. `apps/web/postcss.config.mjs` ✅

```javascript
const postcssConfig = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
export default postcssConfig;
```

#### 2. `apps/web/next.config.ts` ✅

- Removed Mantine optimize package imports
- Added `@bypass/ui` to `transpilePackages`

#### 3. `apps/web/src/app/layout.tsx` ✅

- Removed `@mantine/core/styles.css` import
- Removed `ColorSchemeScript`
- Added `<html className="dark">` (forced dark mode like extension)

#### 4. `apps/web/src/app/layout.css` ✅

```css
@import '@bypass/ui/styles/globals.css';

@source '../**/*.{ts,tsx}';

::selection {
  background: var(--primary);
}
```

#### 5. `xo.config.ts` ✅

Added `dark` class to ignore list for better-tailwindcss linter.

---

## Phase 1: Provider Migration ✅ COMPLETED

### File: `apps/web/src/app/provider/AppProviders.tsx` ✅

**Removed:**

- `MantineProvider` import and wrapper
- `mantineTheme` import from `@bypass/shared`

**Added:**

- `TooltipProvider` from `@bypass/ui`
- Kept `DynamicProvider` and `AuthProvider` as-is

**Result structure:**

```tsx
<TooltipProvider>
  <DynamicProvider>
    <AuthProvider>
      {children}
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  </DynamicProvider>
</TooltipProvider>
```

---

## Phase 2: Home Page Components

### 2a. AppHeader (`apps/web/src/app/components/AppHeader.tsx`)

**Mantine components to replace:**

- `Box` → `<div>`
- `Center` → `<div className="flex items-center justify-center">`

**CSS migration:**
Convert `AppHeader.module.css` to Tailwind:

```css
/* Current */
.header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  height: 72px;
  max-height: 72px;
  background-color: rgba(var(--mantine-color-dark-7), 0.4);
  border-bottom: 1px solid var(--mantine-color-dark-6);
  backdrop-filter: blur(8px);
}

/* Convert to Tailwind classes in component */
```

**Action:** Delete `AppHeader.module.css` after migration

---

### 2b. PageHeader (`apps/web/src/app/components/PageHeader.tsx`)

**Mantine components to replace:**

- `Button` → shadcn `Button` from `@bypass/ui`
- `Flex` → `<div className="flex">`
- `Group` → `<div className="flex items-center">`
- `Title` → `<h1>` + Tailwind classes

**Props to migrate:**

- `mt="4.375rem"` → `className="mt-[4.375rem]"` or nearest Tailwind value
- `fz={{ base: '2.1875rem', md: '2.8125rem' }}` → `className="text-[2.1875rem] md:text-[2.8125rem]"`
- `justify="center"` → `className="justify-center"`
- `ta="center"` → `className="text-center"`
- `gap={{ base: 20, md: 120 }}` → `className="gap-5 md:gap-[120px]"`
- `direction={{ base: 'column', md: 'row' }}` → `className="flex-col md:flex-row"`

**Button migration:**

- `radius="xl"` → shadcn default or `className="rounded-xl"`
- `size="lg"` → shadcn `size="lg"`
- `variant="gradient"` → Use shadcn `variant="default"` with custom gradient class
- `gradient={{ from: '#6850ff', to: '#a750ff', deg: 90 }}` → `className="bg-gradient-to-r from-[#6850ff] to-[#a750ff]"`
- `fz="1rem"` → `className="text-base"`

**CSS migration:**
`PageHeader.module.css` has only button hover override - move to Tailwind

**Action:** Delete `PageHeader.module.css` after migration

---

### 2c. SalientFeatures (`apps/web/src/app/components/SalientFeatures.tsx`)

**Mantine components to replace:**

- `Box` → `<div>`
- `Flex` → `<div className="flex">`
- `Grid`/`GridCol` → Tailwind grid classes
- `Text` → `<span>`/`<p>` + Tailwind classes

**Props to migrate:**

- `pos="relative"` → `className="relative"`
- `mb="2.5rem"` → `className="mb-10"` (2.5rem ≈ 40px)
- `fw={500}` → `className="font-medium"`
- `fz="2rem"` → `className="text-3xl"` (2rem ≈ 32px)
- `c="#7e67ff"` → `className="text-[#7e67ff]"`
- `mt="2.33rem"` → `className="mt-9"` (2.33rem ≈ 37px)
- `size="md"` → `className="text-base"`
- `mt="9.375rem"` → `className="mt-[9.375rem]"`
- `span={{ base: 12, sm: 5 }}` → `className="col-span-12 sm:col-span-5"`

**CSS migration:**
`SalientFeatures.module.css` has border styling:

```css
.borderBox {
  border-bottom: 30px solid rgba(106, 80, 255, 0.4);
}
```

Convert to: `className="border-b-[30px] border-b-[rgba(106,80,255,0.4)]"`

**Action:** Delete `SalientFeatures.module.css` after migration

---

### 2d. Footer (`apps/web/src/app/components/Footer.tsx`)

**Mantine components to replace:**

- `ActionIcon` → `<Button variant="ghost" size="icon">` or plain `<a>` with icon
- `Box` → `<div>`
- `Flex` → `<div className="flex">`
- `Text` → `<span>` + Tailwind

**Icon migration:**

- `react-icons` (BsGithub, MdExtension, RiTimeFill) → Hugeicons equivalents

**Props to migrate:**

- `pos="relative"` → `className="relative"`
- `w="100%"` → `className="w-full"`
- `justify="space-around"` → `className="justify-around"`
- `direction="column"` → `className="flex-col"`
- `align="center"` → `className="items-center"`
- `ml="0.625rem"` → `className="ml-2.5"`
- `fw={500}` → `className="font-medium"`
- `fz="1.1rem"` → `className="text-lg"`
- `radius="xl"` → `className="rounded-xl"`
- `size="xl"` → `className="size-12"`
- `color="gray.2"` → `className="text-gray-200"`

**CSS migration:**
`Footer.module.css` has responsive breakpoints:

```css
.infoContainer {
  margin-top: 10px;
  @mixin smaller-than $mantine-breakpoint-sm {
    margin-top: 0;
  }
}
```

Convert to: `className="mt-2.5 sm:mt-0"`

Similarly for other responsive classes.

**Action:** Delete `Footer.module.css` after migration

---

### 2e. Home Page (`apps/web/src/app/page.tsx`)

**Mantine components to replace:**

- `Box` → `<div>`
- `Container` → `<div className="mx-auto max-w-7xl">` (xl = 1280px)

**CSS migration:**
`page.module.css` has only background color:

```css
.container {
  background-color: #131b21;
}
```

Convert to: `className="bg-[#131b21]"`

**Action:** Delete `page.module.css` after migration

---

## Phase 3: Panel Pages

### 3a. Bookmark Panel

#### File: `apps/web/src/app/bookmark-panel/page.tsx`

**Mantine components to replace:**

- `Container` → `<div className="mx-auto max-w-3xl h-screen px-0 flex flex-col">`
- `Box` → `<div>`
- Props: `h="100vh"` → `className="h-screen"`, `px={0}` → `className="px-0"`

**CSS migration:**
`page.module.css`:

```css
.container {
  display: flex;
  flex-direction: column;
}
.innerContainer {
  flex: 1;
  overflow: hidden auto;
}
```

Convert to Tailwind classes.

**Action:** Delete `page.module.css` after migration

#### File: `apps/web/src/app/bookmark-panel/components/VirtualRow.tsx`

**Mantine components to replace:**

- `Flex` → `<div className="flex">`
- Props: `h="100%"` → `className="h-full"`

**CSS migration:**
`VirtualRow.module.css`:

```css
.bookmarkWrapper {
  cursor: pointer;
  user-select: none;
}
```

Already has Tailwind classes in component, just need to add these.

**Action:** Delete `VirtualRow.module.css` after migration

---

### 3b. Persons Panel

#### File: `apps/web/src/app/persons-panel/page.tsx`

**Mantine components to replace:**

- `Container` → `<div className="mx-auto max-w-3xl h-screen px-0 flex flex-col">`
- `Box` → `<div>`
- `Switch` → shadcn `Switch` from `@bypass/ui`

**Switch migration (following extension pattern):**

```tsx
<div className="flex items-center gap-2">
  <Switch
    checked={orderByRecency}
    onCheckedChange={() => setOrderByRecency((prev) => !prev)}
  />
  <span className="text-sm">Recency</span>
</div>
```

**Props to preserve:**

- `data-testid="recency-switch"` - keep for tests

**CSS migration:**
`page.module.css` has switch styling:

```css
.orderBySwitch {
  --switch-height: 28px !important;
}
.orderBySwitchBody {
  display: flex;
  align-items: center;
}
.orderBySwitchLabelWrapper {
  @mixin smaller-than $mantine-breakpoint-sm {
    display: none;
  }
}
```

Convert to Tailwind: `className="hidden sm:block"` for label wrapper

**Action:** Delete `page.module.css` after migration

#### File: `apps/web/src/app/persons-panel/components/PersonVirtualCell.tsx`

**Mantine components to replace:**

- `Box` → `<div>`
- Props: `p="0.75rem"` → `className="p-3"`, `h="100%"` → `className="h-full"`

---

### 3c. Web-Ext Page

#### File: `apps/web/src/app/web-ext/page.tsx`

**Mantine components to replace:**

- `Button` → shadcn `Button` from `@bypass/ui`
- `Center` → `<div className="flex items-center justify-center">`
- `Container` → `<div className="mx-auto max-w-3xl px-0">`
- `Stack` → `<div className="flex flex-col">`

**Button migration:**

- `fullWidth` → `className="w-full"`
- `radius="xl"` → `className="rounded-xl"`
- `size="md"` → shadcn `size="default"` or `size="lg"`
- `loading={isLoading}` → shadcn Button doesn't have loading prop, use conditional rendering or Spinner
- `color={isLoggedIn ? 'teal' : 'red'}` → Use variant or custom classes
- `rightSection` → Use flex with icon inside button children
- `disabled` → shadcn `disabled` prop

**Icon migration:**

- `react-icons` (FaUserTag, RiBookmarkFill, RiLoginCircleFill, RiLogoutCircleRFill) → Hugeicons equivalents

**CSS migration:**
`page.module.css`:

```css
.stack {
  width: 40%;
  @mixin smaller-than $mantine-breakpoint-sm {
    width: 80%;
  }
}
```

Convert to: `className="w-[40%] sm:w-[80%]"`

**Action:** Delete `page.module.css` after migration

---

## Phase 4: Final Cleanup

### Files to Delete (CSS Modules)

1. `apps/web/src/app/page.module.css`
2. `apps/web/src/app/components/styles/AppHeader.module.css`
3. `apps/web/src/app/components/styles/PageHeader.module.css`
4. `apps/web/src/app/components/styles/SalientFeatures.module.css`
5. `apps/web/src/app/components/styles/Footer.module.css`
6. `apps/web/src/app/bookmark-panel/page.module.css`
7. `apps/web/src/app/bookmark-panel/components/styles/VirtualRow.module.css`
8. `apps/web/src/app/persons-panel/page.module.css`
9. `apps/web/src/app/web-ext/page.module.css`

### Package Cleanup

Remove from `apps/web/package.json`:

- `@mantine/core`
- `@mantine/hooks`
- `postcss-preset-mantine`
- `postcss-simple-vars`

### Config Cleanup

Remove from `apps/web/next.config.ts`:

```typescript
experimental: {
  optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
}
```

Add:

```typescript
transpilePackages: ['@bypass/shared', '@bypass/trpc', '@bypass/ui'],
```

---

## Summary Table

| Phase | Status | Files | Mantine Components               |
| ----- | ------ | ----- | -------------------------------- |
| 0     | ✅     | 4     | Setup only                       |
| 1     | ✅     | 1     | MantineProvider                  |
| 2a    | ⏳     | 2     | Box, Center                      |
| 2b    | ⏳     | 2     | Button, Flex, Group, Title       |
| 2c    | ⏳     | 2     | Box, Flex, Grid, GridCol, Text   |
| 2d    | ⏳     | 2     | ActionIcon, Box, Flex, Text      |
| 2e    | ⏳     | 2     | Box, Container                   |
| 3a    | ⏳     | 3     | Box, Container, Flex             |
| 3b    | ⏳     | 3     | Box, Container, Switch           |
| 3c    | ⏳     | 2     | Button, Center, Container, Stack |
| 4     | ⏳     | -     | Cleanup                          |

**Total: ~19 files to modify, ~9 CSS files to delete**

**Completed: 2 phases**
**Remaining: 8 phases**

---

## Verification Commands

After migration is complete:

```bash
pnpm lint
pnpm typecheck:all
```

---

## Migration Rules Reference

From `apps/extension/shadcn-migration.md`:

1. Never modify components inside @bypass/ui to fit usecase. Instead get confirmation from the user.
2. Migrate className to use tailwind classes and remove file if that file is not used anywhere else post your changes.
3. When migrating margins, paddings, gap, etc, use native values supported by tailwind instead of using rem. Use nearest supported value. If nearest value is still too far, get confirmation from the user.
4. If there is a shadcn component that needs to be added using shadcn cli, get user confirmation.
5. Once you add a shadcn component using CLI, never modify it.
6. Remember we are using baseui with shadcn, not radixui. Also we are using tailwindcss v4.
7. Run pnpm lint and pnpm typecheck:all after changes are done.
8. Use icons from hugeicons package.
