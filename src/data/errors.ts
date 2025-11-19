/**
 * Error Messages and Error Handling Configuration
 * Centralized location for all error messages and error handling logic
 */

export const ERROR_MESSAGES = {
  // Flashcard generation errors
  FLASHCARD: {
    AI_GENERATION_FAILED: 'Failed to generate flashcards using AI. Please try again with a different topic or check your internet connection.',
    INVALID_JSON_RESPONSE: 'The AI response was not in the expected format. Please try again.',
    PARSING_ERROR: 'Failed to process the AI response. Please try again.',
    EMPTY_RESPONSE: 'AI returned an empty response. Please try again.',
    INVALID_STRUCTURE: 'AI response structure is invalid. Please try again.',
    MISSING_FIELDS: 'Some flashcards are missing required information. Please try again.',
    EMPTY_TOPIC: 'Topic cannot be empty. Please provide a valid topic.',
    INVALID_COUNT: 'Number of flashcards must be between 1 and 10.',
    INVALID_SUBJECT: 'Subject must be physics, chemistry, or biology.',
    NO_FLASHCARDS_GENERATED: 'No flashcards were generated. Please try again.'
  },
  
  // API and network errors
  NETWORK: {
    CONNECTION_ERROR: 'Network error occurred. Please check your connection and try again.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.'
  },
  
  // Authentication and authorization errors
  AUTH: {
    API_KEY_ERROR: 'AI service authentication failed. The API key is missing or invalid.',
    AI_GATEWAY_ERROR: 'AI Gateway authentication failed. Please check your configuration.',
    UNAUTHORIZED: 'Unauthorized access to AI service. Please verify your credentials.',
    RATE_LIMIT_ERROR: 'Too many requests to AI service. Please wait a moment and try again.',
    OIDC_TOKEN_ERROR: 'AI Gateway OIDC token is missing or expired. Please refresh your environment.'
  },
  
  // General application errors
  GENERAL: {
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
    VALIDATION_ERROR: 'Invalid input provided. Please check your input and try again.',
    PROCESSING_ERROR: 'Error processing your request. Please try again.'
  }
} as const;

/**
 * Error types for categorizing different kinds of errors
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  AI_PROCESSING = 'AI_PROCESSING',
  PARSING = 'PARSING',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Categorize error based on error message or type
 */
export function categorizeError(error: Error): ErrorType {
  const errorMessage = error.message.toLowerCase();
  
  // Check for authentication/authorization errors first (most specific)
  if (errorMessage.includes('gatewayauthenticationerror') || 
      errorMessage.includes('gatewayerror') ||
      errorMessage.includes('oidc token') ||
      errorMessage.includes('api key') || 
      errorMessage.includes('unauthorized') || 
      errorMessage.includes('authentication') ||
      errorMessage.includes('rate limit')) {
    return ErrorType.AUTH;
  }
  
  // Network related errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') || 
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout')) {
    return ErrorType.NETWORK;
  }
  
  // Validation errors
  if (errorMessage.includes('validation') || 
      errorMessage.includes('invalid') || 
      errorMessage.includes('required') ||
      errorMessage.includes('must be between') ||
      errorMessage.includes('cannot be empty')) {
    return ErrorType.VALIDATION;
  }
  
  // Parsing errors
  if (errorMessage.includes('json') || 
      errorMessage.includes('parse') || 
      errorMessage.includes('format') ||
      errorMessage.includes('unexpected token')) {
    return ErrorType.PARSING;
  }
  
  // AI processing errors
  if (errorMessage.includes('ai') || 
      errorMessage.includes('generation') || 
      errorMessage.includes('model') ||
      errorMessage.includes('flashcard') ||
      errorMessage.includes('no output generated')) {
    return ErrorType.AI_PROCESSING;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message based on error type and context
 */
export function getErrorMessage(error: Error, context: 'flashcard' | 'chat' | 'general' = 'general'): string {
  const errorType = categorizeError(error);
  const errorMessage = error.message.toLowerCase();
  
  // Handle specific flashcard errors
  if (context === 'flashcard') {
    if (errorMessage.includes('empty') && errorMessage.includes('topic')) {
      return ERROR_MESSAGES.FLASHCARD.EMPTY_TOPIC;
    }
    
    if (errorMessage.includes('count') || errorMessage.includes('between 1 and')) {
      return ERROR_MESSAGES.FLASHCARD.INVALID_COUNT;
    }
    
    if (errorMessage.includes('subject') || errorMessage.includes('physics') || errorMessage.includes('chemistry') || errorMessage.includes('biology')) {
      return ERROR_MESSAGES.FLASHCARD.INVALID_SUBJECT;
    }
    
    if (errorMessage.includes('json') || errorMessage.includes('parse')) {
      return ERROR_MESSAGES.FLASHCARD.PARSING_ERROR;
    }
    
    if (errorMessage.includes('empty response')) {
      return ERROR_MESSAGES.FLASHCARD.EMPTY_RESPONSE;
    }
    
    if (errorMessage.includes('invalid') && errorMessage.includes('structure')) {
      return ERROR_MESSAGES.FLASHCARD.INVALID_STRUCTURE;
    }
    
    if (errorMessage.includes('missing') && (errorMessage.includes('question') || errorMessage.includes('answer'))) {
      return ERROR_MESSAGES.FLASHCARD.MISSING_FIELDS;
    }
    
    if (errorMessage.includes('no flashcards')) {
      return ERROR_MESSAGES.FLASHCARD.NO_FLASHCARDS_GENERATED;
    }
  }
  
  // Handle by error type
  switch (errorType) {
    case ErrorType.NETWORK:
      if (errorMessage.includes('timeout')) {
        return ERROR_MESSAGES.NETWORK.TIMEOUT_ERROR;
      }
      return ERROR_MESSAGES.NETWORK.CONNECTION_ERROR;
      
    case ErrorType.AUTH:
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        return ERROR_MESSAGES.AUTH.RATE_LIMIT_ERROR;
      }
      if (errorMessage.includes('unauthorized')) {
        return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      }
      return ERROR_MESSAGES.AUTH.API_KEY_ERROR;
      
    case ErrorType.VALIDATION:
      return ERROR_MESSAGES.GENERAL.VALIDATION_ERROR;
      
    case ErrorType.PARSING:
      return context === 'flashcard' 
        ? ERROR_MESSAGES.FLASHCARD.PARSING_ERROR 
        : ERROR_MESSAGES.GENERAL.PROCESSING_ERROR;
        
    case ErrorType.AI_PROCESSING:
      return context === 'flashcard' 
        ? ERROR_MESSAGES.FLASHCARD.AI_GENERATION_FAILED 
        : ERROR_MESSAGES.GENERAL.PROCESSING_ERROR;
        
    default:
      return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
  }
}

/**
 * Get appropriate HTTP status code based on error type
 */
export function getHttpStatusCode(error: Error): number {
  const errorType = categorizeError(error);
  const errorMessage = error.message.toLowerCase();
  
  switch (errorType) {
    case ErrorType.AUTH:
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        return 429; // Too Many Requests
      }
      return 401; // Unauthorized
      
    case ErrorType.VALIDATION:
      return 400; // Bad Request
      
    case ErrorType.NETWORK:
      if (errorMessage.includes('timeout')) {
        return 408; // Request Timeout
      }
      return 503; // Service Unavailable
      
    case ErrorType.AI_PROCESSING:
    case ErrorType.PARSING:
      return 422; // Unprocessable Entity
      
    default:
      return 500; // Internal Server Error
  }
}

/**
 * Create a standardized error response for API endpoints
 */
export function createErrorResponse(error: Error, context: 'flashcard' | 'chat' | 'general' = 'general') {
  const userMessage = getErrorMessage(error, context);
  const errorType = categorizeError(error);
  const statusCode = getHttpStatusCode(error);
  
  return {
    success: false,
    error: userMessage,
    errorType,
    statusCode,
    message: userMessage,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a detailed error response with user-friendly information only
 */
export function createDetailedErrorResponse(error: Error, context: 'flashcard' | 'chat' | 'general' = 'general') {
  const userMessage = getErrorMessage(error, context);
  const errorType = categorizeError(error);
  const statusCode = getHttpStatusCode(error);
  
  return {
    success: false,
    error: userMessage,
    errorType,
    statusCode,
    message: userMessage,
    timestamp: new Date().toISOString()
  };
}

/**
 * Log error with context for debugging
 */
export function logError(error: Error, context: string, additionalInfo?: any) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    type: categorizeError(error),
    timestamp: new Date().toISOString(),
    additionalInfo
  });
}