'use client';

import { useState } from 'react';

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className={`text-white flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`} style={{ backgroundColor: '#181818' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#303030' }}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold">AI Tutor</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg transition-colors hover:bg-gray-700"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#303030'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-colors"
          style={{ backgroundColor: '#303030' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#303030'}
          title="Start new chat"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {!isCollapsed && <span className="text-sm font-medium">New chat</span>}
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Chats
            </h2>
            <div className="space-y-1">
              {chats.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  No chats yet
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      currentChatId === chat.id
                        ? 'text-white'
                        : 'text-gray-300'
                    }`}
                    style={{ 
                      backgroundColor: currentChatId === chat.id ? '#303030' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (currentChatId !== chat.id) {
                        e.currentTarget.style.backgroundColor = '#303030';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentChatId !== chat.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-sm font-medium truncate">{chat.title}</h3>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatTimestamp(chat.timestamp)}</span>
                        <span>{chat.messageCount} messages</span>
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all ml-2"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Delete chat"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: '#303030' }}>
        {!isCollapsed && (
          <div className="text-xs text-gray-500 text-center">
            AI Tutor Chat v1.0
          </div>
        )}
      </div>
    </div>
  );
}