'use server';

/**
 * @fileOverview Server-side utility for uploading assets to Cloudinary.
 * Specifically used for high-performance video reels.
 */

import { createHash } from 'crypto';

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
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  if (!cloudName || !apiSecret || !apiKey) {
    throw new Error('Cloudinary credentials (Cloud Name, API Key, or Secret) are missing. Please check your environment variables.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'yazzfolio_motion';
  
  // Cloudinary Signature Logic:
  // 1. Collect and sort parameters alphabetically
  // 2. String to sign: 'parameter1=value1&parameter2=value2<API_SECRET>'
  // 3. Hash the resulting string using SHA-1
  const sortedParams = `folder=${folder}&timestamp=${timestamp}`;
  const stringToSign = `${sortedParams}${apiSecret}`;
  
  const signature = createHash('sha1')
    .update(stringToSign)
    .digest('hex');

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
      console.error('Cloudinary API Error:', result.error);
      throw new Error(`Cloudinary Error: ${result.error.message}`);
    }

    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary Upload Execution Error:', error);
    throw new Error(error.message || 'An unexpected error occurred during Cloudinary upload.');
  }
}