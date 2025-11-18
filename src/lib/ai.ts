import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { config } from './config';

// Initialize the OpenAI provider through Vercel AI SDK
export const aiModel = openai(config.ai.model);

// Generate text using Vercel AI SDK
export async function generateAIText(prompt: string) {
  const { text } = await generateText({
    model: aiModel,
    prompt,
  });
  
  return text;
}

// Stream text using Vercel AI SDK  
export function streamAIText(prompt: string) {
  return streamText({
    model: aiModel,
    prompt,
  });
}