import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { z } from 'zod';
import { config, getEnvironmentConfig } from '@/lib/config';
import { ChatMessage } from '@/types';
import { generateFlashcards } from '@/lib/flashcards';
import { PROMPTS } from '@/data/prompts';
import { createDetailedErrorResponse, logError, getHttpStatusCode, getErrorMessage } from '@/data/errors';
import { processMessagesForChat } from '@/lib/chat-context';

export async function POST(req: NextRequest) {
  try {
    // Validate environment configuration
    getEnvironmentConfig();

    // Parse the request body
    const { messages }: { messages: ChatMessage[] } = await req.json();
    
    // Process messages using chat-context utilities with proper error handling
    let formattedMessages, contextualPrompt;
    try {
      const result = processMessagesForChat(messages, PROMPTS.TUTOR_SYSTEM);
      formattedMessages = result.formattedMessages;
      contextualPrompt = result.contextualPrompt;
    } catch (validationError) {
      // Handle validation errors with user-friendly responses
      const errorMessage = (validationError as Error).message;
      
      // Return user-friendly error response for validation issues
      const errorResponse = {
        success: false,
        error: errorMessage,
        errorType: 'VALIDATION',
        statusCode: 400,
        message: `Error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create streaming response using Vercel AI SDK with tool calling support
    const result = await streamText({
      model: `openai/${config.ai.model}`,
      messages: formattedMessages,
      temperature: config.ai.temperature,
      system: contextualPrompt,
      tools: {
        generateFlashcards: {
          description: PROMPTS.TOOLS.GENERATE_FLASHCARDS.description,
          inputSchema: z.object({
            topic: z.string().describe(PROMPTS.TOOLS.GENERATE_FLASHCARDS.topicDescription),
            count: z.number().min(1).max(10).describe(PROMPTS.TOOLS.GENERATE_FLASHCARDS.countDescription),
            subject: z.enum(['physics', 'chemistry', 'biology']).describe(PROMPTS.TOOLS.GENERATE_FLASHCARDS.subjectDescription)
          }),
          execute: async ({ topic, count, subject }) => {
            try {
              // Validate input parameters
              if (!topic || topic.trim().length === 0) {
                throw new Error('Topic is required and cannot be empty');
              }
              
              if (count < 1 || count > 10) {
                throw new Error('Count must be between 1 and 10');
              }
              
              if (!['physics', 'chemistry', 'biology'].includes(subject)) {
                throw new Error('Subject must be physics, chemistry, or biology');
              }

              const flashcards = await generateFlashcards({ topic: topic.trim(), count, subject });
              
              if (!flashcards || flashcards.length === 0) {
                throw new Error('No flashcards were generated');
              }
              
              return {
                success: true,
                flashcards,
                message: `Successfully generated ${flashcards.length} flashcards for "${topic}" in ${subject}`
              };
            } catch (error) {
              // Log error with context
              logError(error as Error, 'flashcard-tool-execution', { topic, count, subject });
              
              // Return detailed error response for tool execution
              return createDetailedErrorResponse(error as Error, 'flashcard');
            }
          }
        }
      }
    });

    // Create a custom streaming response that includes both text and tool results
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream text chunks
          for await (const chunk of result.textStream) {
            // Send text chunks with '0:' prefix for compatibility with frontend
            const textChunk = `0:${JSON.stringify(chunk)}\n`;
            controller.enqueue(encoder.encode(textChunk));
          }
          
          // Get and send tool results
          const toolResults = await result.toolResults;
          for (const toolResult of toolResults) {
            const toolChunk = `2:${JSON.stringify(toolResult)}\n`;
            controller.enqueue(encoder.encode(toolChunk));
          }
          
          controller.close();
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          
          // Send error as text content that the frontend can display
          const errorMessage = getErrorMessage(streamError as Error, 'chat');
          const errorChunk = `0:${JSON.stringify(`${errorMessage}`)}\n`;
          controller.enqueue(encoder.encode(errorChunk));
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    // Log the full error for debugging
    logError(error as Error, 'chat-api-main', { 
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });
    
    // Create detailed error response
    const errorResponse = createDetailedErrorResponse(error as Error, 'chat');
    const statusCode = getHttpStatusCode(error as Error);
    
    // Handle specific error types with appropriate status codes
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}