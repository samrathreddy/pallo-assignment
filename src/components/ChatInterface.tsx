'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ChatInterfaceProps } from '@/types';

// Animated placeholder component
const AnimatedPlaceholder = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400 pointer-events-none">
      <span>AI is responding</span>
      <div className="flex ml-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading,
  isStreaming = false,
  messageFlashcards = {},
  onViewFlashcards,
  onLikeMessage,
  onDislikeMessage
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const centeredInputRef = useRef<HTMLInputElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const isUserScrollingRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Check if user is at the bottom with a reasonable threshold
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 10;
  };

  // Auto-scroll to bottom when new messages arrive (only if should auto-scroll)
  useEffect(() => {
    // Check if new messages were added
    if (messages.length > lastMessageCountRef.current) {
      if (shouldAutoScroll && !isUserScrollingRef.current) {
        // Clear any existing timeout
        if (autoScrollTimeoutRef.current) {
          clearTimeout(autoScrollTimeoutRef.current);
        }
        
        // Small delay to ensure DOM is updated
        autoScrollTimeoutRef.current = setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
              top: messagesContainerRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 50);
        
        setHasNewMessages(false);
      } else {
        // User is scrolled up, show new message indicator
        setHasNewMessages(true);
      }
    }
    
    lastMessageCountRef.current = messages.length;
    
    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [messages, shouldAutoScroll]);

  // Track user scroll behavior with improved detection
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const currentScrollTop = messagesContainerRef.current.scrollTop;
    const scrollDirection = currentScrollTop > lastScrollTopRef.current ? 'down' : 'up';
    
    // User is actively scrolling
    isUserScrollingRef.current = true;
    
    // Clear any existing timeout
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }

    // Check if user is at bottom
    const atBottom = isAtBottom();
    
    // If user scrolled up or is not at bottom, disable auto-scroll
    if (scrollDirection === 'up' || !atBottom) {
      setShouldAutoScroll(false);
    } else if (atBottom) {
      // If user scrolled to bottom, re-enable auto-scroll and clear new message indicator
      setShouldAutoScroll(true);
      setHasNewMessages(false);
    }

    lastScrollTopRef.current = currentScrollTop;

    // Reset user scrolling flag after a delay
    setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  };

  // Focus input on mount
  useEffect(() => {
    // Focus the appropriate input field
    if (messages.length === 0) {
      // Focus the centered input when no messages
      centeredInputRef.current?.focus();
    } else {
      // Focus the bottom input when there are messages
      inputRef.current?.focus();
    }
  }, [messages.length]);

  // Handle loading state changes for auto-scroll
  useEffect(() => {
    if (isLoading && shouldAutoScroll) {
      // When AI starts responding, scroll to show the loading indicator
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [isLoading, shouldAutoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      // Force auto-scroll when user sends a message
      setShouldAutoScroll(true);
      isUserScrollingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const scrollToBottom = () => {
    setShouldAutoScroll(true);
    setHasNewMessages(false);
    isUserScrollingRef.current = false;
    
    // Scroll the messages container directly instead of using scrollIntoView
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      // Format the content to preserve markdown formatting
      const formattedContent = content;
      await navigator.clipboard.writeText(formattedContent);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleLike = (messageId: string) => {
    if (onLikeMessage) {
      onLikeMessage(messageId);
    }
  };

  const handleDislike = (messageId: string) => {
    if (onDislikeMessage) {
      onDislikeMessage(messageId);
    }
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#212121' }}>
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto min-h-0 ${messages.length === 0 ? 'flex items-center justify-center' : 'p-2 sm:p-3 space-y-2 sm:space-y-3'}`}
      >
        {messages.length === 0 ? (
          <div className="w-full max-w-2xl px-4">
              {/* Simple suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                <button
                  onClick={() => onSendMessage("What is photosynthesis?")}
                  disabled={isLoading}
                  className="p-3 rounded-lg border text-left transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#303030', borderColor: '#404040', color: '#d1d5db' }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#404040')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#303030')}
                >
                  <div className="text-sm">What is photosynthesis?</div>
                </button>
                
                <button
                  onClick={() => onSendMessage("Make flashcards about Newton's laws")}
                  disabled={isLoading}
                  className="p-3 rounded-lg border text-left transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#303030', borderColor: '#404040', color: '#d1d5db' }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#404040')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#303030')}
                >
                  <div className="text-sm">Make flashcards about Newton's laws</div>
                </button>
                
                <button
                  onClick={() => onSendMessage("Explain chemical bonding and generate few flash cards")}
                  disabled={isLoading}
                  className="p-3 rounded-lg border text-left transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#303030', borderColor: '#404040', color: '#d1d5db' }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#404040')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#303030')}
                >
                  <div className="text-sm">Explain chemical bonding and generate few flash cards</div>
                </button>
                
                <button
                  onClick={() => onSendMessage("Create flashcards about DNA structure")}
                  disabled={isLoading}
                  className="p-3 rounded-lg border text-left transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#303030', borderColor: '#404040', color: '#d1d5db' }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#404040')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#303030')}
                >
                  <div className="text-sm">Create flashcards about DNA structure</div>
                </button>
              </div>
              
              {/* Centered input area */}
              <div className="w-full">
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    ref={centeredInputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "" : "Ask me anything about science or request flashcards..."}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#303030', 
                      borderColor: '#404040'
                    }}
                  />
                  <AnimatedPlaceholder isLoading={isLoading} />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: inputValue.trim() && !isLoading ? '#3b82f6' : '#6b7280' }}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-3 sm:px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'max-w-[85%] sm:max-w-sm lg:max-w-md bg-blue-500 text-white'
                    : 'max-w-[95%] sm:max-w-lg lg:max-w-2xl text-white'
                }`}
                style={message.role === 'assistant' ? { backgroundColor: '#303030' } : {}}
              >
                <div className="break-words prose prose-sm max-w-none">
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-white">
                      {message.content}
                    </div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          // Customize markdown elements for better styling
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="ml-2" {...props} />,
                          code: ({node, inline, ...props}: any) =>
                            inline ? (
                              <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ backgroundColor: '#404040', color: '#e5e7eb' }} {...props} />
                            ) : (
                              <code className="block p-2 rounded text-sm font-mono overflow-x-auto my-2" style={{ backgroundColor: '#404040', color: '#e5e7eb' }} {...props} />
                            ),
                          strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                          em: ({node, ...props}) => <em className="italic" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 pl-4 italic my-2" style={{ borderColor: '#6b7280', color: '#d1d5db' }} {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div
                    className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100' : ''
                    }`}
                    style={message.role === 'assistant' ? { color: '#9ca3af' } : {}}
                  >
                    {formatTimestamp(message.timestamp)}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {/* Action buttons for assistant messages */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-1">
                        {/* Like button */}
                        <button
                          onClick={() => handleLike(message.id)}
                          className={`p-1 rounded transition-all duration-200 hover:bg-gray-600 ${
                            message.liked ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                          }`}
                          title="Like this response"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              message.liked ? 'scale-110' : 'hover:scale-110'
                            }`} 
                            fill={message.liked ? 'currentColor' : 'none'} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" 
                            />
                          </svg>
                        </button>

                        {/* Dislike button */}
                        <button
                          onClick={() => handleDislike(message.id)}
                          className={`p-1 rounded transition-all duration-200 hover:bg-gray-600 ${
                            message.disliked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                          }`}
                          title="Dislike this response"
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              message.disliked ? 'scale-110 rotate-180' : 'hover:scale-110 rotate-180'
                            }`} 
                            fill={message.disliked ? 'currentColor' : 'none'} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" 
                            />
                          </svg>
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyMessage(message.content, message.id)}
                          className={`p-1 rounded transition-all duration-200 hover:bg-gray-600 ${
                            copiedMessageId === message.id ? 'text-green-400' : 'text-gray-400 hover:text-blue-400'
                          }`}
                          title={copiedMessageId === message.id ? 'Copied!' : 'Copy message'}
                        >
                          {copiedMessageId === message.id ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* View Cards button for assistant messages with flashcards */}
                    {message.role === 'assistant' && 
                     messageFlashcards[message.id] && 
                     messageFlashcards[message.id].length > 0 && 
                     onViewFlashcards && (
                      <button
                        onClick={() => onViewFlashcards(message.id)}
                        className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-md transition-colors touch-manipulation ml-2"
                        title={`View ${messageFlashcards[message.id].length} flashcard${messageFlashcards[message.id].length !== 1 ? 's' : ''}`}
                      >
                        📚 View Cards ({messageFlashcards[message.id].length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="text-white max-w-[95%] sm:max-w-lg lg:max-w-2xl px-3 sm:px-4 py-2 rounded-lg" style={{ backgroundColor: '#303030' }}>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!shouldAutoScroll && messages.length > 0 && (
        <div className="absolute bottom-20 sm:bottom-24 right-4 sm:right-8">
          <button
            onClick={scrollToBottom}
            className={`relative bg-blue-500 text-white p-2 sm:p-2.5 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 touch-manipulation ${
              hasNewMessages ? 'animate-pulse' : ''
            }`}
            aria-label="Scroll to bottom"
          >
            {hasNewMessages && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            )}
            {hasNewMessages && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Input Area - Only show when there are messages */}
      {messages.length > 0 && (
        <div className="border-t p-2 sm:p-3 flex-shrink-0" style={{ borderColor: '#404040' }}>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "" : "Ask me anything about science or request flashcards..."}
                disabled={isLoading}
                className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed touch-manipulation"
                style={{ 
                  backgroundColor: '#303030', 
                  borderColor: '#404040'
                }}
              />
              {isLoading && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400 pointer-events-none">
                  <span className="text-sm sm:text-base">AI is responding</span>
                  <div className="flex ml-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-500 text-white text-sm sm:text-base rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation min-w-[60px] sm:min-w-[70px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                <span className="hidden sm:inline">Send</span>
              )}
              {!isLoading && (
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}