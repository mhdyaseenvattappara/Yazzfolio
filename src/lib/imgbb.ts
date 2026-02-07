/**
 * Utility function to upload an image file to ImgBB.
 * @param file The image file to upload.
 * @param onProgress Callback for tracking upload progress (simulated as ImgBB doesn't provide native XHR progress for this endpoint easily)
 * @returns A promise that resolves to the uploaded image URL.
 */
export async function uploadToImgBB(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_IMGBB_API_KEY' || apiKey === '') {
    console.error('ImgBB API key is missing in environment variables (NEXT_PUBLIC_IMGBB_API_KEY).');
    throw new Error('Image upload service is not configured. Please add your ImgBB API key to the environment variables.');
  }

  // Initial progress kick-off
  if (onProgress) onProgress(15);

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (onProgress) onProgress(75);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `ImgBB upload failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.data?.url) {
      if (onProgress) onProgress(100);
      // Returns the direct image URL (i.ibb.co)
      return result.data.url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image to ImgBB: Invalid response format');
    }
  } catch (error: any) {
    console.error('ImgBB Upload Error:', error);
    throw new Error(error.message || 'An unexpected error occurred during image upload.');
  }
}
