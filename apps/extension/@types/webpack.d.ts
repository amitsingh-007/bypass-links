/**
 * This file contains changes required for webpack config in TS
 */

type Falsy = false | 0 | '' | null | undefined;

declare global {
  /**
   * @link https://stackoverflow.com/a/53981706/8694064
   */
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
    }
  }

  /**
   * @link https://github.com/microsoft/TypeScript/issues/16655#issuecomment-797044678
   */

  interface Array<T> {
    filter<S extends T>(
      predicate: BooleanConstructor,
      thisArg?: any
    ): Exclude<S, Falsy>[];
  }
}

export {};
