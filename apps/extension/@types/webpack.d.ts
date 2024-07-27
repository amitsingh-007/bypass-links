declare global {
  /**
   * @link https://stackoverflow.com/a/53981706/8694064
   */
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
    }
  }
}

export {};
