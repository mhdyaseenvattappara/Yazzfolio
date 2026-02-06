
'use server';
/**
 * @fileOverview A flow to suggest tags for a portfolio item.
 *
 * - suggestTags - A function that handles the tag suggestion process.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestTagsInputSchema = z.object({
  title: z.string().describe('The title of the portfolio item.'),
  description: z.string().describe('The description of the portfolio item.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of 5-7 relevant tags.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(
  input: SuggestTagsInput
): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: { schema: SuggestTagsInputSchema },
  output: { schema: SuggestTagsOutputSchema },
  prompt: `You are an expert creative director. Based on the provided project title and description, generate 5-7 relevant and concise tags for a portfolio website.

The tags should be keywords that categorize the project's skills, deliverables, and industry.

Project Title: {{{title}}}
Project Description: {{{description}}}

Provide your response as a JSON object with a "tags" array.`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
