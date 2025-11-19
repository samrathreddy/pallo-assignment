'use client';

import { useState, useEffect, useRef } from 'react';
import { FlashcardViewerProps, ViewMode } from '@/types';

export default function FlashcardViewer({
  flashcards,
  viewMode,
  onModeChange,
  containerWidth
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gridShowAnswers, setGridShowAnswers] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset to first card and hide answer when flashcards change
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setGridShowAnswers({});
  }, [flashcards]);

  // Handle navigation
  const goToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleGridAnswer = (index: number) => {
    setGridShowAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode === 'grid' || flashcards.length <= 1) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (viewMode === 'grid' || flashcards.length <= 1 || touchStartX.current === null || touchStartY.current === null) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous card
        goToPrevious();
      } else if (deltaX < 0 && currentIndex < flashcards.length - 1) {
        // Swipe left - go to next card
        goToNext();
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Handle empty state
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#303030' }}>
          <svg className="w-8 h-8" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No flashcards yet</h3>
        <p className="max-w-sm" style={{ color: '#9ca3af' }}>
          Ask the AI to generate flashcards for any science topic to get started with your studies.
        </p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const hasMultipleCards = flashcards.length > 1;

  // Determine card size based on view mode and container width
  const getCardClasses = () => {
    if (viewMode === 'grid') {
      // In grid mode, optimize for 2-column layout
      return {
        container: "border rounded-lg shadow-sm overflow-hidden h-full flex flex-col min-h-[280px]",
        containerStyle: { backgroundColor: '#303030', borderColor: '#404040' },
        padding: "p-3",
        questionText: "text-sm font-medium text-white leading-relaxed",
        answerText: "text-sm text-white leading-relaxed",
        button: "px-2 py-1 rounded-md text-xs font-medium transition-colors touch-manipulation"
      };
    } else {
      // Single/carousel mode - larger cards
      return {
        container: "border rounded-lg shadow-sm overflow-hidden h-full flex flex-col min-h-[300px] sm:min-h-[350px]",
        containerStyle: { backgroundColor: '#303030', borderColor: '#404040' },
        padding: "p-4 sm:p-6",
        questionText: "text-base sm:text-lg font-medium text-white leading-relaxed",
        answerText: "text-sm sm:text-base text-white leading-relaxed",
        button: "px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation"
      };
    }
  };

  // Render single flashcard component
  const renderCard = (card: typeof flashcards[0], index: number, showAns: boolean, toggleAns: () => void) => {
    const classes = getCardClasses();
    
    return (
      <div className={classes.container} style={classes.containerStyle}>
        {/* Subject badge */}
        <div className="px-3 py-2 border-b" style={{ backgroundColor: '#404040', borderColor: '#505050' }}>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
            card.subject === 'physics' ? 'bg-blue-100 text-blue-800' :
            card.subject === 'chemistry' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {card.subject}
          </span>
        </div>

        {/* Question section */}
        <div className={`${classes.padding} flex-1`}>
          <div className="mb-3">
            <h3 className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#9ca3af' }}>
              Question
            </h3>
            <p className={classes.questionText}>
              {card.question}
            </p>
          </div>

          {/* Answer section */}
          <div className="border-t pt-3" style={{ borderColor: '#505050' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium uppercase tracking-wide" style={{ color: '#9ca3af' }}>
                Answer
              </h3>
              <button
                onClick={toggleAns}
                className={`${classes.button}`}
                style={{
                  backgroundColor: showAns ? '#404040' : '#1e40af',
                  color: showAns ? '#d1d5db' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = showAns ? '#505050' : '#1e3a8a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = showAns ? '#404040' : '#1e40af';
                }}
              >
                {showAns ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className={`transition-all duration-200 ${
              showAns ? 'opacity-100' : 'opacity-30'
            }`}>
              {showAns ? (
                <p className={classes.answerText}>
                  {card.answer}
                </p>
              ) : (
                <p className="text-xs italic" style={{ color: '#9ca3af' }}>
                  Tap "Show" to reveal the answer
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card footer with metadata */}
        <div className="px-3 py-2 border-t" style={{ backgroundColor: '#404040', borderColor: '#505050' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: '#9ca3af' }}>
            <span>
              {new Date(card.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flashcard-viewer">
      {/* View Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Flashcards ({flashcards.length})
        </h2>
        <div className="flex items-center space-x-1 rounded-lg p-1 self-start sm:self-auto" style={{ backgroundColor: '#303030' }}>
          <button
            onClick={() => onModeChange('single')}
            className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
              viewMode === 'single'
                ? 'shadow-sm'
                : ''
            }`}
            style={{
              backgroundColor: viewMode === 'single' ? '#404040' : 'transparent',
              color: viewMode === 'single' ? '#ffffff' : '#9ca3af'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'single') {
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'single') {
                e.currentTarget.style.color = '#9ca3af';
              }
            }}
            title="Single card view"
          >
            Single
          </button>
          <button
            onClick={() => onModeChange('grid')}
            className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
              viewMode === 'grid'
                ? 'shadow-sm'
                : ''
            }`}
            style={{
              backgroundColor: viewMode === 'grid' ? '#404040' : 'transparent',
              color: viewMode === 'grid' ? '#ffffff' : '#9ca3af'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.color = '#9ca3af';
              }
            }}
            title="Grid view"
          >
            Grid
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 gap-3 auto-rows-fr">
          {flashcards.map((card, index) => (
            <div key={card.id}>
              {renderCard(card, index, gridShowAnswers[index] || false, () => toggleGridAnswer(index))}
            </div>
          ))}
        </div>
      )}

      {/* Single View */}
      {viewMode === 'single' && (
        <>
          {/* Card counter for multiple cards */}
          {hasMultipleCards && (
            <div className="flex items-center justify-center mb-4">
              <div className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>
                Card {currentIndex + 1} of {flashcards.length}
              </div>
            </div>
          )}

          {/* Flashcard display */}
          <div
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="select-none"
          >
            {renderCard(currentCard, currentIndex, showAnswer, toggleAnswer)}
          </div>

          {/* Navigation buttons for multiple cards (bottom) */}
          {hasMultipleCards && (
            <div className="flex items-center justify-center space-x-4 mt-4">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                style={{ 
                  backgroundColor: '#303030', 
                  borderColor: '#404040', 
                  color: '#d1d5db' 
                }}
                onMouseEnter={(e) => {
                  if (currentIndex !== 0) {
                    e.currentTarget.style.backgroundColor = '#404040';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentIndex !== 0) {
                    e.currentTarget.style.backgroundColor = '#303030';
                  }
                }}
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <button
                onClick={goToNext}
                disabled={currentIndex === flashcards.length - 1}
                className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                style={{ 
                  backgroundColor: '#303030', 
                  borderColor: '#404040', 
                  color: '#d1d5db' 
                }}
                onMouseEnter={(e) => {
                  if (currentIndex !== flashcards.length - 1) {
                    e.currentTarget.style.backgroundColor = '#404040';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentIndex !== flashcards.length - 1) {
                    e.currentTarget.style.backgroundColor = '#303030';
                  }
                }}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <svg className="w-4 h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

        </>
      )}
    </div>
  );
}