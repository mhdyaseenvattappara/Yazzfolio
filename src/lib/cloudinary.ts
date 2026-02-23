'use server';

/**
 * @fileOverview Server-side utility for uploading assets to Cloudinary.
 * Specifically used for high-performance video reels.
 */

import { createHash } from 'node:crypto';

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
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || 'dqwcd4v7g').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '393249629561516').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  if (!cloudName || !apiKey) {
    throw new Error('Cloudinary credentials (Cloud Name or API Key) are missing.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'yazzfolio_motion';
  
  // Cloudinary Signature Logic:
  // 1. Collect all parameters except api_key, file, cloud_name, resource_type
  // 2. Sort parameters alphabetically
  // 3. String to sign: 'parameter1=value1&parameter2=value2<API_SECRET>'
  // 4. Hash the resulting string using SHA-1
  
  const parameters: Record<string, string> = {
    folder: folder,
    timestamp: timestamp.toString()
  };

  // Sort keys alphabetically
  const sortedKeys = Object.keys(parameters).sort();
  
  // Create signature string
  const signatureParts = sortedKeys.map(key => `${key}=${parameters[key]}`);
  const signatureString = `${signatureParts.join('&')}${apiSecret}`;
  
  // Generate SHA-1 hash
  const signature = createHash('sha1')
    .update(signatureString)
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
