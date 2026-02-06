'use server';
/**
 * @fileOverview An AI flow for generating humorous design/studio tips.
 *
 * - generateComedyTip - Returns a short, funny piece of "advice" or a joke.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateComedyTipOutputSchema = z.object({
  tip: z.string().describe('A short, funny, professional design joke or tip.'),
});
export type GenerateComedyTipOutput = z.infer<typeof GenerateComedyTipOutputSchema>;

export async function generateComedyTip(): Promise<GenerateComedyTipOutput> {
  return generateComedyTipFlow({});
}

const generateComedyTipFlow = ai.defineFlow(
  {
    name: 'generateComedyTipFlow',
    inputSchema: z.object({}),
    outputSchema: GenerateComedyTipOutputSchema,
  },
  async () => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a sarcastic but brilliant Creative Director. 
      Generate a one-sentence "Pro Tip" or joke about design, freelancing, or studio life. 
      It should be funny, relatable to a professional designer (Mhd Yaseen V), and snappy.
      Example: "Pro Tip: If the client says it needs to 'pop', just increase the saturation until your eyes hurt, then back off 5%."
      Example: "FREELANCE LIFE: Coffee is a food group, and 'Final_v2_FINAL_REAL.psd' is a lie we tell ourselves."`,
      output: {
        schema: GenerateComedyTipOutputSchema
      }
    });

    if (!output) {
      return { tip: "Pro Tip: When in doubt, just use more whitespace and call it 'minimalist luxury'." };
    }

    return output;
  }
);
