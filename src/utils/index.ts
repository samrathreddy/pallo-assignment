import { ChatMessage, Flashcard } from '@/types';

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create a new chat message
export function createChatMessage(
  role: 'user' | 'assistant',
  content: string
): ChatMessage {
  return {
    id: generateId(),
    role,
    content,
    timestamp: new Date(),
  };
}

// Create a new flashcard
export function createFlashcard(
  question: string,
  answer: string,
  subject: 'physics' | 'chemistry' | 'biology'
): Flashcard {
  return {
    id: generateId(),
    question,
    answer,
    subject,
    createdAt: new Date(),
  };
}

// Format timestamp for display
export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Check if a message contains flashcard generation intent
export function detectFlashcardIntent(message: string): boolean {
  const flashcardKeywords = [
    'flashcard',
    'flash card',
    'make cards',
    'create cards',
    'generate cards',
    'quiz me',
    'test me',
    'review cards',
  ];
  
  const lowerMessage = message.toLowerCase();
  return flashcardKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Validate environment variables
export function validateEnvironment(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}