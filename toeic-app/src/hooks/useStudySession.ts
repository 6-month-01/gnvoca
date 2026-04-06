import { useState, useCallback, useEffect } from 'react';
import type { Word } from '../types';

export function useStudySession(
  allWords: Word[],
  selectedDays: string[],
  knownWordIds: string[],
  onSaveKnown: (id: string) => void
) {
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize session words
  useEffect(() => {
    if (selectedDays.length === 0 || allWords.length === 0) return;

    // Filter by days
    let filtered = allWords.filter((w) => selectedDays.includes(w.day));
    
    // Remove known words
    const knownSet = new Set(knownWordIds);
    filtered = filtered.filter((w) => !knownSet.has(w.id));

    // Shuffle
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    setSessionWords(filtered);
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsFinished(filtered.length === 0);
  }, [allWords, selectedDays, knownWordIds]);

  const handleNext = useCallback(() => {
    if (!isRevealed) {
      setIsRevealed(true);
    } else {
      if (currentIndex + 1 < sessionWords.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsRevealed(false);
      } else {
        setIsFinished(true);
      }
    }
  }, [isRevealed, currentIndex, sessionWords.length]);

  const markKnown = useCallback(() => {
    if (sessionWords.length === 0 || isFinished) return;
    
    const currentWord = sessionWords[currentIndex];
    onSaveKnown(currentWord.id);
    
    // Move to next word immediately
    if (currentIndex + 1 < sessionWords.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    } else {
      setIsFinished(true);
    }
  }, [sessionWords, currentIndex, isFinished, onSaveKnown]);

  return {
    currentWord: sessionWords[currentIndex] || null,
    isRevealed,
    currentIndex,
    totalWords: sessionWords.length,
    isFinished,
    handleNext,
    markKnown,
  };
}
