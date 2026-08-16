/**
 * Shared by the web app and the tRPC package so the two cannot disagree about
 * which Firebase project they are talking to. The extension has its own
 * `IS_PROD` since Vite exposes `import.meta.env` instead.
 */
export const IS_PROD = process.env.NODE_ENV === 'production';
