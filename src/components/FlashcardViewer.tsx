'use client';

import { FlashcardViewerProps } from '@/types';

export default function FlashcardViewer({ 
  flashcards, 
  viewMode, 
  onModeChange 
}: FlashcardViewerProps) {
  return (
    <div className="flashcard-viewer">
      {/* Flashcard viewer will be implemented in task 6 */}
      <p className="text-gray-500">Flashcard viewer placeholder</p>
      <p className="text-sm text-gray-400">
        {flashcards.length} flashcards in {viewMode} mode
      </p>
    </div>
  );
}