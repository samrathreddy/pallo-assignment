'use client';

import { ChatInterfaceProps } from '@/types';

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading 
}: ChatInterfaceProps) {
  return (
    <div className="chat-interface">
      <div className="messages">
        {/* Messages will be implemented in task 5 */}
        <p className="text-gray-500">Chat interface placeholder</p>
      </div>
      <div className="input-area">
        {/* Input area will be implemented in task 5 */}
        <p className="text-gray-500">Input area placeholder</p>
      </div>
    </div>
  );
}