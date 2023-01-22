import Compressor from 'compressorjs';

export const getCompressedImage = (file: Blob): Promise<Blob> =>
  new Promise((resolve, reject) => {
    new Compressor(file, {
      maxHeight: 250, // 250px
      convertTypes: ['image/jpeg', 'image/png', 'image/webp'],
      convertSize: 200000, // 200KB
      quality: 0.95,
      success: resolve,
      error: reject,
    });
  });
