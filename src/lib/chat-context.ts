/**
 * Chat Context Management Utilities
 * Handles conversation context and message processing for better AI responses
 */

import { ChatMessage } from '@/types';

/**
 * Content filtering patterns to prevent prompt injection and inappropriate content
 */
const SUSPICIOUS_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /forget\s+everything/i,
  /act\s+as\s+if/i,
  /pretend\s+to\s+be/i,
  /roleplay\s+as/i,
  /override\s+your/i,
  /disregard\s+your/i,
  /new\s+instructions/i
];

/**
 * Maximum message length to prevent abuse
 */
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Maximum number of messages to include in context
 */
const MAX_CONTEXT_MESSAGES = 8;

/**
 * Validates and sanitizes a single message
 */
export function validateMessage(message: ChatMessage): ChatMessage {
  // Basic validation
  if (!message.content || typeof message.content !== 'string') {
    throw new Error('Invalid message content');
  }
  console.log("here")
  console.log(message.content.length)
  
  // Limit message length
  if (message.content.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Your message is too long (${message.content.length} characters). Please keep messages under ${MAX_MESSAGE_LENGTH} characters for better processing.`);
  }
  
  // Check for suspicious content
  const hasSuspiciousContent = SUSPICIOUS_PATTERNS.some(pattern => 
    pattern.test(message.content)
  );
  
  if (hasSuspiciousContent) {
    throw new Error('Please ask questions about science topics only.');
  }
  
  return {
    ...message,
    content: message.content.trim()
  };
}

/**
 * Validates and sanitizes an array of messages
 */
export function validateMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Invalid messages format. Expected an array of messages.');
  }
  
  return messages.map(validateMessage);
}

/**
 * Prepares messages for AI context with proper limiting and formatting
 */
export function prepareMessagesForContext(messages: ChatMessage[]): Array<{role: 'user' | 'assistant', content: string}> {
  const validatedMessages = validateMessages(messages);
  
  // Include recent messages for context (last N messages)
  return validatedMessages
    .slice(-MAX_CONTEXT_MESSAGES)
    .map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
}

/**
 * Generates contextual system prompt based on conversation history
 */
export function generateContextualPrompt(basePrompt: string, messageCount: number): string {
  let contextualPrompt = basePrompt;
  
  if (messageCount > 1) {
    contextualPrompt += `\n\nCONVERSATION CONTEXT: You are continuing a conversation with this student. Reference previous messages when relevant to maintain conversation flow and build on what was already discussed. The student's message history shows their learning journey - use this to provide more personalized and contextual responses while staying within science topics.`;
  }
  
  return contextualPrompt;
}


/**
 * Comprehensive message processing for chat API
 * Handles validation, sanitization, context preparation, and prompt generation
 */
export function processMessagesForChat(messages: ChatMessage[], basePrompt: string) {
  // Validate input
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Invalid messages format. Expected an array of messages.');
  }

  // Validate and sanitize messages
  const validatedMessages = validateMessages(messages);
  
  // Prepare formatted messages for AI context
  const formattedMessages = prepareMessagesForContext(validatedMessages);
  
  // Generate contextual system prompt
  const contextualPrompt = generateContextualPrompt(basePrompt, validatedMessages.length);
  
  return {
    formattedMessages,
    contextualPrompt,
    messageCount: validatedMessages.length
  };
}