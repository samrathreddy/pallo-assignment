import { Flashcard, FlashcardGenerationParams } from '@/types';
import { config } from './config';
import { generateText } from 'ai';
import { PROMPTS } from '@/data/prompts';
import { getErrorMessage, logError } from '@/data/errors';

/**
 * Generate flashcards for a given topic and subject using AI
 * This function creates educational flashcards with actual content
 */
export async function generateFlashcards(params: FlashcardGenerationParams): Promise<Flashcard[]> {
  const { topic, count, subject } = params;

  // Validate parameters
  if (count < 1 || count > config.flashcards.maxCount) {
    throw new Error(`Count must be between 1 and ${config.flashcards.maxCount}`);
  }

  if (!config.flashcards.subjects.includes(subject)) {
    throw new Error(`Subject must be one of: ${config.flashcards.subjects.join(', ')}`);
  }

  if (!topic || topic.trim().length === 0) {
    throw new Error('Topic cannot be empty');
  }

  // Use AI to generate real flashcard content
  const prompt = PROMPTS.FLASHCARD_GENERATION(count, topic, subject);

  try {
    const { text } = await generateText({
      model: `openai/${config.ai.model}`,
      prompt,
      temperature: config.ai.temperature,
    });

    if (!text || text.trim().length === 0) {
      throw new Error('AI returned empty response');
    }

    // Parse the AI response (clean markdown code blocks if present)
    let cleanedText = text.trim();

    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```')) {
      // Remove opening ```json or ```
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '');
      // Remove closing ```
      cleanedText = cleanedText.replace(/\n?```$/, '');
      cleanedText = cleanedText.trim();
    }

    let flashcardData;
    try {
      flashcardData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Raw AI response:', text);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate the response structure
    if (!Array.isArray(flashcardData)) {
      throw new Error('AI response is not an array');
    }

    if (flashcardData.length === 0) {
      throw new Error('AI returned empty flashcard array');
    }

    // Validate each flashcard has required fields
    for (let i = 0; i < flashcardData.length; i++) {
      const card = flashcardData[i];
      if (!card.question || !card.answer) {
        throw new Error(`Flashcard ${i + 1} is missing question or answer`);
      }
      if (typeof card.question !== 'string' || typeof card.answer !== 'string') {
        throw new Error(`Flashcard ${i + 1} has invalid question or answer format`);
      }
    }

    // Create flashcard objects with proper IDs and metadata
    const flashcards: Flashcard[] = flashcardData.map((data: any, i: number) => ({
      id: `flashcard-${Date.now()}-${i}`,
      question: data.question.trim(),
      answer: data.answer.trim(),
      subject,
      createdAt: new Date()
    }));

    return flashcards;
  } catch (error) {
    // Log error with context for debugging
    logError(error as Error, 'generateFlashcards', { topic, count, subject });
    
    // Re-throw with user-friendly error message
    const userFriendlyMessage = getErrorMessage(error as Error, 'flashcard');
    throw new Error(userFriendlyMessage);
  }
}

/**
 * Detect if a user message is requesting flashcard generation
 */
export function detectFlashcardIntent(message: string): boolean {
  const flashcardKeywords = [
    'flashcard', 'flash card', 'flashcards', 'flash cards',
    'make flashcards', 'create flashcards', 'generate flashcards',
    'quiz me', 'test me', 'review cards', 'study cards'
  ];
  
  const lowerMessage = message.toLowerCase();
  return flashcardKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Extract topic and subject from user message for flashcard generation
 */
export function extractFlashcardParams(message: string): Partial<FlashcardGenerationParams> {
  const lowerMessage = message.toLowerCase();
  
  // Extract subject
  let subject: 'physics' | 'chemistry' | 'biology' | undefined;
  if (lowerMessage.includes('physics')) subject = 'physics';
  else if (lowerMessage.includes('chemistry')) subject = 'chemistry';
  else if (lowerMessage.includes('biology')) subject = 'biology';
  
  // Extract count (look for numbers)
  const countMatch = message.match(/(\d+)/);
  const count = countMatch ? Math.min(parseInt(countMatch[1]), config.flashcards.maxCount) : config.flashcards.defaultCount;
  
  // Extract topic (this is a simple heuristic - in practice, the LLM would do this better)
  let topic = 'general concepts';
  const topicKeywords = ['about', 'on', 'for', 'regarding'];
  for (const keyword of topicKeywords) {
    const keywordIndex = lowerMessage.indexOf(keyword);
    if (keywordIndex !== -1) {
      const afterKeyword = message.substring(keywordIndex + keyword.length).trim();
      const words = afterKeyword.split(' ').slice(0, 3); // Take first few words
      if (words.length > 0) {
        topic = words.join(' ');
        break;
      }
    }
  }
  
  return { topic, count, subject };
}