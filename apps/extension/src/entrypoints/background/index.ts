import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  void import('../../BackgroundScript/index.ts');
});
