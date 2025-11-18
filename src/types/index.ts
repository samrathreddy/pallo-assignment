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

// Tool schema for flashcard generation
export interface FlashcardToolSchema {
  name: 'generateFlashcards';
  description: string;
  parameters: {
    type: 'object';
    properties: {
      topic: { type: 'string'; description: string };
      count: { type: 'number'; description: string };
      subject: { type: 'string'; enum: ['physics', 'chemistry', 'biology'] };
    };
    required: ['topic', 'count', 'subject'];
  };
}

// Constant for the actual tool schema
export const FLASHCARD_TOOL_SCHEMA: FlashcardToolSchema = {
  name: 'generateFlashcards',
  description: 'Generate educational flashcards for science topics',
  parameters: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'The science topic for flashcards' },
      count: { type: 'number', description: 'Number of flashcards to generate' },
      subject: { type: 'string', enum: ['physics', 'chemistry', 'biology'] }
    },
    required: ['topic', 'count', 'subject']
  }
};

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
}

export interface FlashcardViewerProps {
  flashcards: Flashcard[];
  viewMode: 'single' | 'carousel' | 'grid';
  onModeChange: (mode: ViewMode) => void;
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