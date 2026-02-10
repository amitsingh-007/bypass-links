# Mantine to Shadcn Migration

1. Never modify components inside @bypass/ui to fit usecase. Instead get confirmation from the user.
2. Migrate className to use tailwind classes and remove file if that file is not used anywhere else post your changes.
3. When migrating margins, paddings, gap, etc, use native values supported by tailwind instead of using rem. Use nearest supported value. If nearest value is still too far, get confirmation from the user.
4. If there is a shadcn component that needs to be added using shadcn cli, get user confirmation.
