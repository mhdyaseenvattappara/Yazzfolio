
'use server';
/**
 * @fileOverview An AI flow for drafting professional replies to contact messages.
 *
 * - draftReply - A function that takes a message and generates a tailored email response.
 * - DraftReplyInput - The input type for the draftReply function.
 * - DraftReplyOutput - The return type for the draftReply function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DraftReplyInputSchema = z.object({
  senderName: z.string().describe('The name of the person who sent the message.'),
  originalMessage: z.string().describe('The content of the original message.'),
});
export type DraftReplyInput = z.infer<typeof DraftReplyInputSchema>;

const DraftReplyOutputSchema = z.object({
  replySubject: z.string().describe('A professional subject line for the email.'),
  replyBody: z.string().describe('The tailored body of the reply email.'),
});
export type DraftReplyOutput = z.infer<typeof DraftReplyOutputSchema>;

export async function draftReply(
  input: DraftReplyInput
): Promise<DraftReplyOutput> {
  return draftReplyFlow(input);
}

const draftReplyFlow = ai.defineFlow(
  {
    name: 'draftReplyFlow',
    inputSchema: DraftReplyInputSchema,
    outputSchema: DraftReplyOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a professional assistant for Mhd Yaseen V, a high-end Graphic and UI/UX Designer.
      
      Draft a professional, friendly, and concise email reply to the following message from ${input.senderName}.
      
      ORIGINAL MESSAGE:
      "${input.originalMessage}"
      
      THE REPLY SHOULD:
      1. Thank them for reaching out.
      2. Acknowledge the specific content of their message intelligently.
      3. Maintain a creative, professional, and helpful tone.
      4. Suggest a next step (e.g., "I'll review the details and get back to you with a proposal" or "Would you like to schedule a quick 15-minute call?").
      5. End with a professional sign-off from Mhd Yaseen V.
      
      Keep the body concise (under 150 words) to ensure it fits in a mailto link safely.`,
      output: {
        schema: DraftReplyOutputSchema
      }
    });

    if (!output) {
      throw new Error('AI failed to generate a reply draft.');
    }

    return output;
  }
);
