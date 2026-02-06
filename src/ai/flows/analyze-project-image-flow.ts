
'use server';
/**
 * @fileOverview An AI flow for analyzing a project image to suggest a title and overview.
 *
 * - analyzeProjectImage - A function that takes an image and returns a suggested title and description.
 * - AnalyzeProjectImageInput - The input type for the analyzeProjectImage function.
 * - AnalyzeProjectImageOutput - The return type for the analyzeProjectImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeProjectImageInputSchema = z.object({
  image: z
    .string()
    .describe(
      "The source image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeProjectImageInput = z.infer<
  typeof AnalyzeProjectImageInputSchema
>;

const AnalyzeProjectImageOutputSchema = z.object({
  title: z.string().describe('A catchy, professional title for the project.'),
  description: z.string().describe('A professional overview of the project, including style, purpose, and visual elements.'),
});
export type AnalyzeProjectImageOutput = z.infer<
  typeof AnalyzeProjectImageOutputSchema
>;

export async function analyzeProjectImage(
  input: AnalyzeProjectImageInput
): Promise<AnalyzeProjectImageOutput> {
  return analyzeProjectImageFlow(input);
}

const analyzeProjectImageFlow = ai.defineFlow(
  {
    name: 'analyzeProjectImageFlow',
    inputSchema: AnalyzeProjectImageInputSchema,
    outputSchema: AnalyzeProjectImageOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { media: { url: input.image } },
        { text: `You are an expert creative director. Analyze this project image and provide:
        1. A concise, professional project title.
        2. A compelling project overview (about 2-3 sentences) describing the design style, potential goals, and visual impact.
        
        Provide the result as a JSON object with 'title' and 'description' keys.` }
      ],
      output: {
        schema: AnalyzeProjectImageOutputSchema
      }
    });

    if (!output) {
      throw new Error('AI analysis failed to return content.');
    }

    return output;
  }
);
