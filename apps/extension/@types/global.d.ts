interface Window {
  SW_INITIALIZED?: boolean;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
