import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useAppState } from './hooks/useAppState';
import { useStudySession } from './hooks/useStudySession';
import { DaySelectorView } from './components/DaySelectorView';
import { StudyView } from './components/StudyView';
import { KnownWordsView } from './components/KnownWordsView';
import { BookOpen } from 'lucide-react';
import type { Word } from './types';

type Screen = 'loading' | 'daySelector' | 'study' | 'knownWords';

function App() {
  const {
    state,
    setAllWords,
    setSelectedDays,
    addKnownWord,
    removeKnownWord,
    clearAllData,
  } = useAppState();

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    state.allWords.length === 0 ? 'loading' : 'daySelector'
  );

  useEffect(() => {
    // Automatically load data.csv if words are empty
    if (state.allWords.length === 0) {
        fetch('/data.csv')
        .then((res) => res.text())
        .then((text) => {
          Papa.parse(text, {
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
              const parsedWords: Word[] = results.data
                .map((row: any) => {
                  if (!row[0] || !row[1] || !row[2]) return null;
                  if (row[0].trim().toLowerCase() === 'day') return null; // Skip header if present
                  return {
                    id: `${row[0]}_${row[1]}`.replace(/\s+/g, ''),
                    day: row[0].trim(),
                    english: row[1].trim(),
                    korean: row[2].trim(),
                  };
                })
                .filter((w): w is Word => w !== null);

              if (parsedWords.length > 0) {
                setAllWords(parsedWords);
                setCurrentScreen('daySelector');
              } else {
                console.error('No valid words found in CSV.');
              }
            },
          });
        })
        .catch((err) => {
          console.error('Failed to auto-load CSV:', err);
        });
    }
  }, [state.allWords.length, setAllWords]);

  const studySession = useStudySession(
    state.allWords,
    state.selectedDays,
    state.knownWordIds,
    addKnownWord
  );

  const handleClearData = () => {
    if (window.confirm('정말로 모든 데이터를 삭제하고 리셋하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearAllData();
      // Wait for re-render, then it will auto-load data.csv again.
      // Reset screen back to loading to prevent brief glitches.
      setCurrentScreen('loading');
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 flex flex-col bg-gray-50/50">
      
      {/* Global Navigation Bar */}
      {state.allWords.length > 0 && currentScreen !== 'study' && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] z-20 animate-in slide-in-from-top-4 duration-500">
          <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
            <div 
              className="flex items-center gap-2 font-semibold tracking-tight text-gray-900 cursor-pointer"
              onClick={() => setCurrentScreen('daySelector')}
            >
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <BookOpen size={18} />
              </div>
              그냥
            </div>
            <nav className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => setCurrentScreen('daySelector')}
                className={`text-sm font-medium transition-colors hover:text-gray-900 ${currentScreen === 'daySelector' ? 'text-blue-600' : 'text-gray-500'}`}
              >
                학습 메뉴
              </button>
              <button
                onClick={() => setCurrentScreen('knownWords')}
                className={`text-sm font-medium transition-colors hover:text-gray-900 flex items-center gap-1.5 ${currentScreen === 'knownWords' ? 'text-blue-600' : 'text-gray-500'}`}
              >
                아는 단어
                {state.knownWordIds.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {state.knownWordIds.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${state.allWords.length > 0 && currentScreen !== 'study' ? 'pt-16' : ''}`}>
        {currentScreen === 'loading' && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-gray-400 font-medium animate-pulse">데이터를 불러오는 중입니다...</div>
          </div>
        )}
        
        {currentScreen === 'daySelector' && (
          <DaySelectorView
            allWords={state.allWords}
            selectedDays={state.selectedDays}
            onChangeSelectedDays={setSelectedDays}
            onStartStudy={() => setCurrentScreen('study')}
            onClearData={handleClearData}
          />
        )}

        {currentScreen === 'study' && (
          <StudyView
            {...studySession}
            onNext={studySession.handleNext}
            onMarkKnown={studySession.markKnown}
            onExit={() => setCurrentScreen('daySelector')}
          />
        )}

        {currentScreen === 'knownWords' && (
          <KnownWordsView
            knownWordIds={state.knownWordIds}
            allWords={state.allWords}
            onRemoveKnownWord={removeKnownWord}
            onBack={() => setCurrentScreen('daySelector')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
