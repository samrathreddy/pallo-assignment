// Application configuration
export const config = {
  ai: {
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.7,
  },
  flashcards: {
    defaultCount: 5,
    maxCount: 10,
    subjects: ['physics', 'chemistry', 'biology'] as const,
  },
  ui: {
    defaultViewMode: 'single' as const,
    maxMessagesDisplay: 50,
  },
} as const;

// Validate required environment variables
export function getEnvironmentConfig() {
  const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;

  if (!AI_GATEWAY_API_KEY) {
    throw new Error('AI_GATEWAY_API_KEY environment variable is required');
  }

  return {
    AI_GATEWAY_API_KEY: AI_GATEWAY_API_KEY,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    VERCEL_URL: process.env.VERCEL_URL,
  };
}