
'use server';
/**
 * @fileOverview An AI flow for removing the background from an image.
 *
 * - removeBackground - A function that takes an image and returns a version with the background removed.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RemoveBackgroundInputSchema = z.object({
  image: z
    .string()
    .describe(
      "The source image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<
  typeof RemoveBackgroundInputSchema
>;

const RemoveBackgroundOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The resulting image with the background removed, as a data URI."
    ).optional(),
  error: z.string().optional(),
});
export type RemoveBackgroundOutput = z.infer<
  typeof RemoveBackgroundOutputSchema
>;

// This is the exported function that the UI will call.
export async function removeBackground(
  input: RemoveBackgroundInput
): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input) => {
    try {
      // Use a model capable of image editing/segmentation.
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
          { media: { url: input.image } },
          { text: 'Remove the background completely. The output image must be a PNG with a transparent background. Do not add any extra elements, shadows, or reflections. Only the main subject of the image should remain.' }
        ],
        config: {
          responseModalities: ['IMAGE'],
        },
      });

      if (media?.url) {
        return { image: media.url };
      }
      
      throw new Error('Failed to generate image. Model did not return media.');
    } catch (err: any) {
        console.error("AI Background Removal Error:", err);
        if (err.message && err.message.includes('429 Too Many Requests')) {
            return { error: "You've exceeded the free request limit for this feature. Please try again later." };
        }
        return { error: 'The AI model failed to process the image. Please try a different image or try again later.' };
    }
  }
);
