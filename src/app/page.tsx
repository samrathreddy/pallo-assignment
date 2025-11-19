'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatInterface, FlashcardDrawer } from '@/components';
import Sidebar from '@/components/Sidebar';
import { ChatMessage, Flashcard, ViewMode } from '@/types';

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
  messages: ChatMessage[];
  flashcards: Flashcard[];
  messageFlashcards: Record<string, Flashcard[]>;
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcardNotification, setFlashcardNotification] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [isFlashcardDrawerOpen, setIsFlashcardDrawerOpen] = useState(false);
  const [currentFlashcardSet, setCurrentFlashcardSet] = useState<Flashcard[]>([]);
  const [messageFlashcards, setMessageFlashcards] = useState<Record<string, Flashcard[]>>({});

  // Generate unique ID for messages and chats
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Create new chat
  const createNewChat = () => {
    const newChatId = generateId();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: new Date(),
      messageCount: 0,
      messages: [],
      flashcards: [],
      messageFlashcards: {}
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setFlashcards([]);
    setMessageFlashcards({});
    setError(null);
    setFlashcardNotification(null);
  };

  // Select chat
  const selectChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setFlashcards(chat.flashcards);
      setMessageFlashcards(chat.messageFlashcards);
      setError(null);
      setFlashcardNotification(null);
    }
  };

  // Delete chat
  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(c => c.id !== chatId);
      if (remainingChats.length > 0) {
        selectChat(remainingChats[0].id);
      } else {
        setCurrentChatId(null);
        setMessages([]);
        setFlashcards([]);
        setMessageFlashcards({});
      }
    }
  };

  // Update current chat
  const updateCurrentChat = () => {
    if (currentChatId) {
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? {
              ...chat,
              messages,
              flashcards,
              messageFlashcards,
              messageCount: messages.length,
              timestamp: new Date(),
              title: messages.length > 0 
                ? messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? '...' : '')
                : 'New Chat'
            }
          : chat
      ));
    }
  };

  // Clear all flashcards
  const clearFlashcards = () => {
    setFlashcards([]);
    setFlashcardNotification(null);
    setMessageFlashcards({});
  };

  // Open flashcard drawer
  const openFlashcardDrawer = (flashcardsToShow: Flashcard[]) => {
    setCurrentFlashcardSet(flashcardsToShow);
    setIsFlashcardDrawerOpen(true);
  };

  // Close flashcard drawer
  const closeFlashcardDrawer = () => {
    setIsFlashcardDrawerOpen(false);
    setCurrentFlashcardSet([]);
  };

  // View flashcards for a specific message
  const viewMessageFlashcards = (messageId: string) => {
    const messageCards = messageFlashcards[messageId];
    if (messageCards && messageCards.length > 0) {
      openFlashcardDrawer(messageCards);
    }
  };

  // Handle like message
  const handleLikeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, liked: !msg.liked, disliked: false }
        : msg
    ));
  };

  // Handle dislike message
  const handleDislikeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, disliked: !msg.disliked, liked: false }
        : msg
    ));
  };

  // Handle sending messages with streaming support
  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Create new chat if none exists
    let chatId = currentChatId;
    if (!chatId) {
      const newChatId = generateId();
      const newChat: Chat = {
        id: newChatId,
        title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : ''),
        timestamp: new Date(),
        messageCount: 0,
        messages: [],
        flashcards: [],
        messageFlashcards: {}
      };
      
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      chatId = newChatId;
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    let assistantMessageId: string | null = null;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(-4) // Only send last 4 messages for context
        }),
      });

      if (!response.ok) {
        // Try to extract error message from response body
        try {
          const errorData = await response.json();
          const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        } catch (parseError) {
          // If we can't parse the error response, use the status
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let assistantContent = '';
      let flashcardsGenerated = false;

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      assistantMessageId = assistantMessage.id;

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, assistantMessage]);

      // Read the streaming response
      let buffer = '';
      let hasStartedStreaming = false;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            if (line.startsWith('0:')) {
              // Text content chunk - this is the AI response text
              const content = line.substring(2);
              if (content && content !== '""') {
                // Parse JSON string content
                let cleanContent = '';
                try {
                  cleanContent = JSON.parse(content);
                } catch {
                  // If not JSON, use as-is but remove quotes
                  cleanContent = content.replace(/^"/, '').replace(/"$/, '');
                }
                
                if (cleanContent) {
                  // Mark that streaming has started but keep loading state
                  if (!hasStartedStreaming) {
                    hasStartedStreaming = true;
                    setIsStreaming(true);
                  }

                  assistantContent += cleanContent;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  );
                }
              }
            } else if (line.startsWith('2:')) {
              // Tool call result
              try {
                const toolData = JSON.parse(line.substring(2));
                console.log('Tool data received:', toolData);

                // Handle different tool result formats
                let newFlashcards: Flashcard[] = [];

                // Vercel AI SDK format: toolData.output.flashcards
                if (toolData.output?.flashcards) {
                  newFlashcards = toolData.output.flashcards.map((card: any) => ({
                    ...card,
                    id: card.id || generateId(),
                    createdAt: card.createdAt ? new Date(card.createdAt) : new Date()
                  }));

                  // Update assistant message with success message
                  if (toolData.output.message && assistantMessageId) {
                    const successMessage = `\n\n✓ ${toolData.output.message}`;
                    assistantContent += successMessage;
                    setMessages(prev =>
                      prev.map(msg =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: assistantContent }
                          : msg
                      )
                    );
                  }
                } else if (toolData.toolResult?.result?.flashcards) {
                  newFlashcards = toolData.toolResult.result.flashcards.map((card: any) => ({
                    ...card,
                    id: card.id || generateId(),
                    createdAt: card.createdAt ? new Date(card.createdAt) : new Date()
                  }));
                } else if (toolData.result?.flashcards) {
                  // Alternative format
                  newFlashcards = toolData.result.flashcards.map((card: any) => ({
                    ...card,
                    id: card.id || generateId(),
                    createdAt: card.createdAt ? new Date(card.createdAt) : new Date()
                  }));
                } else if (Array.isArray(toolData.flashcards)) {
                  // Direct flashcards array
                  newFlashcards = toolData.flashcards.map((card: any) => ({
                    ...card,
                    id: card.id || generateId(),
                    createdAt: card.createdAt ? new Date(card.createdAt) : new Date()
                  }));
                }

                if (newFlashcards.length > 0) {
                  flashcardsGenerated = true;
                  setFlashcards(prev => [...prev, ...newFlashcards]);
                  
                  // Associate flashcards with the assistant message
                  if (assistantMessageId) {
                    setMessageFlashcards(prev => ({
                      ...prev,
                      [assistantMessageId as string]: newFlashcards
                    }));
                  }
                  
                  setFlashcardNotification(`Generated ${newFlashcards.length} new flashcard${newFlashcards.length !== 1 ? 's' : ''}!`);

                  // Auto-open flashcard drawer
                  openFlashcardDrawer(newFlashcards);

                  // Clear notification after 3 seconds
                  setTimeout(() => setFlashcardNotification(null), 3000);
                }
              } catch (e) {
                console.error('Error parsing tool result:', e, 'Line:', line);
              }
            } else if (line.startsWith('8:')) {
              // Tool call (informational)
              try {
                const toolCall = JSON.parse(line.substring(2));
                console.log('Tool call initiated:', toolCall);
              } catch (e) {
                console.error('Error parsing tool call:', e);
              }
            } else if (line.startsWith('1:')) {
              // Function call
              try {
                const functionCall = JSON.parse(line.substring(2));
                console.log('Function call:', functionCall);
              } catch (e) {
                console.error('Error parsing function call:', e);
              }
            }
          } catch (parseError) {
            console.error('Error parsing streaming line:', parseError, 'Line:', line);
          }
        }
      }

      // Ensure assistant message isn't empty (in case only flashcards were generated)
      if (!assistantContent.trim() && flashcardsGenerated) {
        assistantContent = "I've generated some flashcards for you! Check them out on the right.";
        if (assistantMessageId) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: assistantContent }
                : msg
            )
          );
        }
      }

      // Process any remaining buffer content
      if (buffer.trim()) {
        try {
          if (buffer.startsWith('0:')) {
            const content = buffer.substring(2);
            if (content && content !== '""') {
              let cleanContent = '';
              try {
                cleanContent = JSON.parse(content);
              } catch {
                cleanContent = content.replace(/^"/, '').replace(/"$/, '');
              }
              
              if (cleanContent) {
                assistantContent += cleanContent;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
            }
          }
        } catch (e) {
          console.error('Error processing buffer:', e);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Show error in assistant message instead of removing it
      if (assistantMessageId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: `${errorMessage}` }
              : msg
          )
        );
      } else {
        // If no assistant message was created, show error in UI
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages, isLoading, currentChatId]);

  // Update current chat when messages change
  useEffect(() => {
    if (currentChatId) {
      updateCurrentChat();
    }
  }, [messages, flashcards, messageFlashcards, currentChatId]);

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#212121' }}>
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: '#212121' }}>
        {/* Error Display */}
        {error && (
          <div className="m-4 p-3 border rounded-lg flex-shrink-0" style={{ backgroundColor: '#4c1d1d', borderColor: '#7f1d1d' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-200">Connection Error</h3>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Flashcard Notification */}
        {flashcardNotification && (
          <div className="m-4 p-3 border rounded-lg flex-shrink-0" style={{ backgroundColor: '#1f4d1f', borderColor: '#22c55e' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-green-200">Flashcards Ready!</h3>
                  <p className="text-sm text-green-300 mt-1">{flashcardNotification}</p>
                </div>
              </div>
              <button
                onClick={() => setFlashcardNotification(null)}
                className="text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header */}
          {(currentChatId || messages.length > 0) && (
            <div className="border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#303030', borderColor: '#404040' }}>
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-white">
                  {chats.find(c => c.id === currentChatId)?.title || 'AI Tutor Chat'}
                </h1>
                {messages.length > 0 && (
                  <span className="ml-3 text-sm" style={{ color: '#9ca3af' }}>
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {flashcards.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openFlashcardDrawer(flashcards)}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                    title={`View all ${flashcards.length} flashcards`}
                  >
                    📚 View Cards ({flashcards.length})
                  </button>
                  <button
                    onClick={clearFlashcards}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Clear all flashcards"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 min-h-0" style={{ backgroundColor: '#212121' }}>
            <ChatInterface 
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isStreaming={isStreaming}
              messageFlashcards={messageFlashcards}
              onViewFlashcards={viewMessageFlashcards}
              onLikeMessage={handleLikeMessage}
              onDislikeMessage={handleDislikeMessage}
            />
          </div>
        </div>

        {/* Flashcard Drawer */}
        <FlashcardDrawer
          isOpen={isFlashcardDrawerOpen}
          onClose={closeFlashcardDrawer}
          flashcards={currentFlashcardSet}
          viewMode={viewMode}
          onModeChange={setViewMode}
        />
      </div>
    </div>
  );
}