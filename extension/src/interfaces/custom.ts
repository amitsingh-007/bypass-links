export type GenericObject = Record<string, any>;

export type ValueOf<T> = T[keyof T];

export type VoidFunction = () => void;
