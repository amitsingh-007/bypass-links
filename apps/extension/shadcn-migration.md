# Mantine to Shadcn Migration

1. Never modify components inside @bypass/ui to fit usecase. Instead get confirmation from the user.
2. Migrate className to use tailwind classes and remove file if that file is not used anywhere else post your changes.
3. When migrating margins, paddings, gap, etc, use native values supported by tailwind instead of using rem. Use nearest supported value. If nearest value is still too far, get confirmation from the user.
4. If there is a shadcn component that needs to be added using shadcn cli, get user confirmation.
5. Once you add a shadcn component using CLI, never modify it.
5. Remember we are using baseui with shadcn, not radixui. Also we are using tailwindcss v4.
6. Run pnpm lint and pnpm typecheck:all after changes are done.
7. Use icons from hugeicons package.
