// Core message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Flashcard types
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: 'physics' | 'chemistry' | 'biology';
  createdAt: Date;
}

// Flashcard generation parameters
export interface FlashcardGenerationParams {
  topic: string;
  count: number;
  subject: 'physics' | 'chemistry' | 'biology';
}

// Tool schema for flashcard generation (compatible with Vercel AI SDK)
export const generateFlashcardsToolSchema = {
  name: 'generateFlashcards',
  description: 'Generate educational flashcards for science topics based on user request',
  parameters: {
    type: 'object',
    properties: {
      topic: { 
        type: 'string', 
        description: 'The specific science topic or concept for the flashcards' 
      },
      count: { 
        type: 'number', 
        description: 'Number of flashcards to generate (1-10)',
        minimum: 1,
        maximum: 10
      },
      subject: { 
        type: 'string', 
        enum: ['physics', 'chemistry', 'biology'],
        description: 'The science subject area'
      }
    },
    required: ['topic', 'count', 'subject']
  }
} as const;

// Application state
export interface AppState {
  messages: ChatMessage[];
  flashcards: Flashcard[];
  isLoading: boolean;
  currentFlashcardSet: string | null;
}

// API request/response types
export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  message?: ChatMessage;
  error?: string;
}

// Utility types for API handling
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export interface StreamingResponse {
  content: string;
  finished: boolean;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
}

// Tool execution result
export interface ToolResult {
  toolCallId: string;
  result: any;
  error?: string;
}

// Error handling types
export interface ErrorState {
  type: 'network' | 'llm' | 'tool' | 'client';
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}

// Local storage types
export interface StoredSession {
  sessionId: string;
  messages: ChatMessage[];
  flashcards: Flashcard[];
  lastUpdated: Date;
}

// Environment configuration
export interface EnvironmentConfig {
  VERCEL_API_KEY: string;
  NODE_ENV: 'development' | 'production';
  VERCEL_URL?: string;
}

// Component prop types
export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isStreaming?: boolean;
  messageFlashcards?: Record<string, Flashcard[]>;
  onViewFlashcards?: (messageId: string) => void;
}

export interface FlashcardViewerProps {
  flashcards: Flashcard[];
  viewMode: 'single' | 'carousel' | 'grid';
  onModeChange: (mode: ViewMode) => void;
  containerWidth?: number;
}

export type ViewMode = 'single' | 'carousel' | 'grid';

// Utility types
export type MessageRole = ChatMessage['role'];
export type FlashcardSubject = Flashcard['subject'];
export type ErrorType = ErrorState['type'];

// Loading states
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

// Flashcard display state
export interface FlashcardDisplayState {
  currentIndex: number;
  showAnswer: boolean;
  viewMode: ViewMode;
}

// Message with optional metadata
export interface EnhancedChatMessage extends ChatMessage {
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  isStreaming?: boolean;
}