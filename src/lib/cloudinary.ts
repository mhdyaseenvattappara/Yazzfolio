'use server';

/**
 * @fileOverview Server-side utility for uploading assets to Cloudinary.
 * Specifically used for high-performance video reels.
 */

import { crypto } from 'node:crypto';

/**
 * Uploads a base64 encoded file to Cloudinary.
 * @param base64Data The file data URI.
 * @param resourceType 'image' | 'video' | 'auto'
 * @returns The secure URL of the uploaded asset.
 */
export async function uploadToCloudinary(
  base64Data: string, 
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiSecret || !apiKey) {
    throw new Error('Cloudinary credentials are missing from the environment.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'yazzfolio_motion';
  
  // Create signature for signed upload
  const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
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
