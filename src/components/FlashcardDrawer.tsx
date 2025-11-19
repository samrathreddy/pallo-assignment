'use client';

import { useEffect, useRef, useState } from 'react';
import { FlashcardViewer } from '@/components';
import { Flashcard, ViewMode } from '@/types';

interface FlashcardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function FlashcardDrawer({
  isOpen,
  onClose,
  flashcards,
  viewMode,
  onModeChange
}: FlashcardDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);

  // Set initial drawer width based on screen size
  useEffect(() => {
    const updateDrawerWidth = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1280) {
          setDrawerWidth(700); // xl
        } else if (screenWidth >= 1024) {
          setDrawerWidth(600); // lg
        } else if (screenWidth >= 640) {
          setDrawerWidth(500); // sm
        }
      }
    };

    updateDrawerWidth();
    window.addEventListener('resize', updateDrawerWidth);
    
    return () => {
      window.removeEventListener('resize', updateDrawerWidth);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle swipe to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isResizing) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || isResizing) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    
    // If swiped right more than 100px, close the drawer
    if (deltaX > 100) {
      onClose();
    }
    
    touchStartX.current = null;
  };

  // Handle resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.classList.add('resizing');
    
    const startX = e.clientX;
    const startWidth = drawerWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX;
      const newWidth = Math.max(300, Math.min(window.innerWidth - 100, startWidth + deltaX));
      setDrawerWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle touch resize for mobile
  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.classList.add('resizing');
    
    const startX = e.touches[0].clientX;
    const startWidth = drawerWidth;
    
    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = startX - e.touches[0].clientX;
      const newWidth = Math.max(300, Math.min(window.innerWidth - 50, startWidth + deltaX));
      setDrawerWidth(newWidth);
    };
    
    const handleTouchEnd = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Side Drawer */}
      <div 
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}

        className={`fixed top-0 right-0 h-full shadow-2xl transform z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          ...{
            width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : `${drawerWidth}px`,
            transition: isResizing ? 'none' : 'transform 300ms ease-in-out'
          },
          backgroundColor: '#212121'
        }}
      >
        {/* Resize Handle */}
        <div 
          ref={resizeHandleRef}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeTouchStart}
          className={`resize-handle absolute left-0 top-0 bottom-0 w-2 cursor-col-resize transition-colors z-20 hidden sm:block ${
            isResizing ? 'bg-blue-200' : 'bg-transparent'
          }`}
          onMouseEnter={(e) => !isResizing && (e.currentTarget.style.backgroundColor = '#303030')}
          onMouseLeave={(e) => !isResizing && (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Drag to resize drawer"
        >
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full transition-all duration-200 ${
            isResizing ? 'bg-blue-500 opacity-80 h-12' : 'bg-gray-400 opacity-40'
          }`}></div>
          {/* Resize indicator dots */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-1 transition-opacity duration-200 ${
            isResizing ? 'opacity-80' : 'opacity-0 hover:opacity-60'
          }`}>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Mobile Drag Handle */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1 h-16 bg-gray-300 rounded-l-full opacity-60 sm:hidden"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0 relative" style={{ borderColor: '#404040', backgroundColor: '#303030' }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="truncate">Generated Flashcards</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
              {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''} ready for study
              {isResizing && typeof window !== 'undefined' && window.innerWidth >= 640 && (
                <span className="ml-2 text-blue-600 font-medium">• Width: {drawerWidth}px</span>
              )}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 sm:p-6">
            <FlashcardViewer
              flashcards={flashcards}
              viewMode={viewMode}
              onModeChange={onModeChange}
              containerWidth={drawerWidth}
            />
          </div>
        </div>
        

      </div>
    </>
  );
}