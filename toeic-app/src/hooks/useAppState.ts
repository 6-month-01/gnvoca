import { useState, useEffect } from 'react';
import type { AppState, Word } from '../types';

const INITIAL_STATE: AppState = {
  allWords: [],
  knownWordIds: [],
  selectedDays: [],
};

const STORAGE_KEY = 'toeic-app-state';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : INITIAL_STATE;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return INITIAL_STATE;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [state]);

  const setAllWords = (words: Word[]) => {
    setState((prev) => ({ ...prev, allWords: words }));
  };

  const setSelectedDays = (days: string[]) => {
    setState((prev) => ({ ...prev, selectedDays: days }));
  };

  const addKnownWord = (id: string) => {
    setState((prev) => {
      // Don't add if already known
      if (prev.knownWordIds.includes(id)) return prev;
      return { ...prev, knownWordIds: [...prev.knownWordIds, id] };
    });
  };

  const removeKnownWord = (id: string) => {
    setState((prev) => ({
      ...prev,
      knownWordIds: prev.knownWordIds.filter((knownId) => knownId !== id),
    }));
  };

  const clearAllData = () => {
    setState(INITIAL_STATE);
  };

  const clearSelectedDays = () => {
    setState(prev => ({...prev, selectedDays: []}));
  }

  // Derived state
  const uniqueDays = Array.from(new Set(state.allWords.map((w) => w.day))).sort();

  return {
    state,
    setAllWords,
    setSelectedDays,
    addKnownWord,
    removeKnownWord,
    clearAllData,
    clearSelectedDays,
    uniqueDays,
  };
}
