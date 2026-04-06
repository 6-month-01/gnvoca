export interface Word {
  id: string; // Will use 'day_english' as a unique ID
  day: string;
  english: string;
  korean: string;
}

export interface AppState {
  allWords: Word[];
  knownWordIds: string[];
  selectedDays: string[];
}
