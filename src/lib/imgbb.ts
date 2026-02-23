
'use server';

/**
 * @fileOverview Server-side utility for uploading images to ImgBB.
 */

/**
 * Uploads a base64 encoded image to ImgBB.
 * @param base64Data The image data URI.
 * @returns The direct image URL.
 */
export async function uploadToImgBB(base64Data: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_IMGBB_API_KEY') {
    throw new Error('ImgBB API key is missing. Please add IMGBB_API_KEY to your .env file.');
  }

  // Extract pure base64 if it's a data URI
  const base64Image = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  const formData = new FormData();
  formData.append('image', base64Image);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'ImgBB upload failed');
    }

    // Returns the direct image link
    return result.data.url;
  } catch (error: any) {
    console.error('ImgBB Upload Error:', error);
    throw new Error(error.message || 'An unexpected error occurred during ImgBB upload.');
  }
}
