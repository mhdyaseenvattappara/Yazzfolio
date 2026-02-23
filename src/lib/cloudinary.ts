
'use server';

/**
 * @fileOverview Server-side utility for uploading images to Cloudinary.
 */

import { crypto } from 'node:crypto';

/**
 * Uploads a base64 encoded image to Cloudinary using signed upload.
 * @param base64Data The image data URI.
 * @returns The secure URL of the uploaded image.
 */
export async function uploadToCloudinary(base64Data: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiSecret || !apiKey || apiKey.includes('YOUR_15_DIGIT')) {
    throw new Error('Cloudinary is not fully configured. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your .env file.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'yazzfolio';
  
  // Create signature
  const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || 'Cloudinary upload failed');
    }

    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error(error.message || 'An unexpected error occurred during Cloudinary upload.');
  }
}
