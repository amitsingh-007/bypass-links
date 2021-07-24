import { IShortcut } from "@common/interfaces/shortcuts";

export type Shortcut = Omit<IShortcut, "priority">;
