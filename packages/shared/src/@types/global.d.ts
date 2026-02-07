declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_PROD_ENV: 'true' | 'false';
    NEXT_PUBLIC_HOST_NAME: string;
  }
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
