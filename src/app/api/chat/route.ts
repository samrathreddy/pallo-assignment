import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { config, getEnvironmentConfig } from '@/lib/config';
import { ChatMessage } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // Validate environment configuration
    getEnvironmentConfig();

    
    // Parse the request body
    const { messages }: { messages: ChatMessage[] } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert ChatMessage format to AI SDK format
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get API key from environment
    const envConfig = getEnvironmentConfig();

    // Create streaming response using Vercel AI SDK with AI Gateway
    // The AI SDK automatically uses AI Gateway when model is in 'creator/model-name' format
    const result = await streamText({
      model: `openai/${config.ai.model}`,
      messages: formattedMessages,
      temperature: config.ai.temperature,
      system: `You are an AI tutor specializing in science subjects (Physics, Chemistry, and Biology).
               Help students understand concepts, solve problems, and provide clear explanations.
               Be encouraging and educational in your responses.
               Focus on helping students learn rather than just giving answers.`,
    });

    // Return the streaming response
    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('AI_GATEWAY_API_KEY')) {
        return new Response(
          JSON.stringify({ error: 'API key not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}