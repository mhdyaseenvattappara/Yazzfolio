
'use server';

/**
 * @fileOverview Server-side utility for uploading assets to Cloudinary.
 * Specifically used for high-performance video reels.
 */

import { createHash } from 'node:crypto';

/**
 * Uploads a base64 encoded file to Cloudinary using Signed Uploads.
 * @param base64Data The file data URI.
 * @param resourceType 'image' | 'video' | 'auto'
 * @returns The secure URL of the uploaded asset.
 */
export async function uploadToCloudinary(
  base64Data: string, 
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<string> {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || 'dqwcd4v7g').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '393249629561516').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  if (!apiSecret) {
    throw new Error('Cloudinary API Secret is missing in environment variables. Signed uploads require a secret.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  const folder = 'yazzfolio_motion';
  
  // Cloudinary Signature Requirements:
  // 1. All parameters except file, cloud_name, resource_type, and api_key.
  // 2. Parameters must be sorted alphabetically.
  // 3. Secret appended at the end without & separator.
  
  const paramsToSign: Record<string, string> = {
    folder: folder,
    timestamp: timestamp
  };

  const signatureString = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&') + apiSecret;

  const signature = createHash('sha1')
    .update(signatureString)
    .digest('hex');

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
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
    console.error('Cloudinary Upload Error:', error);
    throw new Error(error.message || 'Failed to upload video to Cloudinary.');
  }
}
