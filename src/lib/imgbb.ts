/**
 * Utility function to upload an image file to ImgBB.
 * @param file The image file to upload.
 * @param onProgress Callback for tracking upload progress (simulated as ImgBB doesn't provide native XHR progress for this endpoint easily)
 * @returns A promise that resolves to the uploaded image URL.
 */
export async function uploadToImgBB(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('ImgBB API key is not configured in environment variables.');
  }

  // Simulate progress steps for better UX
  if (onProgress) onProgress(10);

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (onProgress) onProgress(80);

    const result = await response.json();

    if (result.success) {
      if (onProgress) onProgress(100);
      // Returns the direct image URL
      return result.data.url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image to ImgBB');
    }
  } catch (error: any) {
    console.error('ImgBB Upload Error:', error);
    throw error;
  }
}
