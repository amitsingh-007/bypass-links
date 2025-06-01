interface Window {
  SW_INITIALIZED?: boolean;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
