'use client';

import { ChatInterface, FlashcardViewer } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Tutor Chat
          </h1>
          <p className="text-gray-600">
            Your AI-powered science learning companion
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Chat</h2>
            <ChatInterface 
              messages={[]} 
              onSendMessage={() => {}} 
              isLoading={false} 
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Flashcards</h2>
            <FlashcardViewer 
              flashcards={[]} 
              viewMode="single" 
              onModeChange={() => {}} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}