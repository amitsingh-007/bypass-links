import fs from 'node:fs/promises';

export const rmDirWithRetry = async (
  path: string,
  retries = 3,
  delay = 1000
) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.rm(path, { recursive: true, force: true });
      return;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
};
