declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_PROD_ENV: 'true' | 'false';
    NEXT_PUBLIC_HOST_NAME: string;
    NEXT_PUBLIC_IS_CHROME: 'true' | 'false';
  }
}
