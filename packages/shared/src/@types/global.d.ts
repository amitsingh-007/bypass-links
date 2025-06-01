declare const PROD_ENV: boolean;

declare const HOST_NAME: string;

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
