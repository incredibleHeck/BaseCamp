export interface CompressedImageResult {
  base64: string; 
  rawBase64: string; 
  sizeKB: number;
  originalSizeKB: number;
  width: number;
  height: number;
  type: string;
}

/**
 * Compresses an image file for low bandwidth optimization.
 * Safely handles memory limits and bypasses compression for unsupported types (like PDF).
 */
export const compressImage = (file: File): Promise<CompressedImageResult> => {
  return new Promise((resolve, reject) => {
    // 1. SAFETY CHECK: Bypass compression for PDFs or non-images
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const rawBase64 = dataUrl.split(',')[1];
        resolve({
          base64: dataUrl,
          rawBase64: rawBase64,
          sizeKB: Math.round(file.size / 1024),
          originalSizeKB: Math.round(file.size / 1024),
          width: 0,
          height: 0,
          type: file.type
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
      return;
    }

    // 2. PERFORMANCE: Use object URLs instead of loading huge dataURIs into RAM
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      // 3. Clean up memory immediately once the image is loaded
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1024;

      // Maintain aspect ratio
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
      }
      
      // 4. PNG PRESERVATION: Fill background with white if converting to JPEG
      // Otherwise transparent PNGs might get a black background.
      if (file.type === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }
      
      ctx.drawImage(img, 0, 0, width, height);

      // 5. SMART COMPRESSION: Keep PNGs as PNGs to preserve handwriting edges, compress JPEGs
      const targetMimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = targetMimeType === 'image/jpeg' ? 0.7 : undefined; // quality param only works for jpeg/webp
      
      const dataUrl = canvas.toDataURL(targetMimeType, quality);
      
      const base64Data = dataUrl.split(',')[1];
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      const sizeKB = Math.round(sizeInBytes / 1024);
      const originalSizeKB = Math.round(file.size / 1024);

      resolve({
        base64: dataUrl,
        rawBase64: base64Data,
        sizeKB,
        originalSizeKB,
        width,
        height,
        type: targetMimeType
      });
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };

    img.src = objectUrl;
  });
};