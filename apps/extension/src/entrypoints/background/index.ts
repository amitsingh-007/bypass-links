import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  import('../../BackgroundScript/index.ts').catch((error: unknown) =>
    console.error('[background] Failed to initialize:', error)
  );
});
