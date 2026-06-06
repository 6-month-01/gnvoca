import { useState, useMemo } from 'react';
import { ArrowLeft, Volume2, EyeOff, Search, Shuffle, Check, HelpCircle, BookOpen } from 'lucide-react';
import type { Word } from '../types';

interface WordListViewProps {
  allWords: Word[];
  selectedDays: string[];
  knownWordIds: string[];
  onAddKnownWord: (id: string) => void;
  onRemoveKnownWord: (id: string) => void;
  onBack: () => void;
}

type HideMode = 'none' | 'english' | 'korean';

export function WordListView({
  allWords,
  selectedDays,
  knownWordIds,
  onAddKnownWord,
  onRemoveKnownWord,
  onBack,
}: WordListViewProps) {
  const [hideMode, setHideMode] = useState<HideMode>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffle, setIsShuffle] = useState(false);
  const [hideKnown, setHideKnown] = useState(false);
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  // Local state to track individually revealed words when hidden
  const [individualReveals, setIndividualReveals] = useState<Record<string, { english?: boolean; korean?: boolean }>>({});

  // 1. Filter words by selected days
  const baseWords = useMemo(() => {
    return allWords.filter((w) => selectedDays.includes(w.day));
  }, [allWords, selectedDays]);

  // Format selected days list to display beautifully
  const selectedDaysLabel = useMemo(() => {
    const uniqueDays = Array.from(new Set(allWords.map((w) => w.day)));
    if (selectedDays.length === uniqueDays.length && uniqueDays.length > 0) {
      return '전체 일차';
    }
    if (selectedDays.length > 3) {
      const sorted = [...selectedDays].sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      });
      return `${sorted.slice(0, 3).join(', ')} 외 ${selectedDays.length - 3}개`;
    }
    return selectedDays.join(', ');
  }, [selectedDays, allWords]);

  // 2. Filter by search query and known status
  const processedWords = useMemo(() => {
    let list = [...baseWords];

    // Filter out known words if option is selected
    if (hideKnown) {
      list = list.filter((w) => !knownWordIds.includes(w.id));
    }

    // Filter by search query (English or Korean)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.english.toLowerCase().includes(q) ||
          w.korean.toLowerCase().includes(q)
      );
    }

    // Shuffle if enabled
    if (isShuffle) {
      // Simple pseudo-random shuffle (Fisher-Yates)
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }

    return list;
  }, [baseWords, knownWordIds, hideKnown, searchQuery, isShuffle]);

  // Group by Day if not shuffled
  const groupedWords = useMemo(() => {
    if (isShuffle) return null; // Don't group when shuffled, just show a flat list

    const groups: Record<string, Word[]> = {};
    processedWords.forEach((word) => {
      if (!groups[word.day]) {
        groups[word.day] = [];
      }
      groups[word.day].push(word);
    });

    // Sort days numerically
    return Object.entries(groups).sort(([dayA], [dayB]) => {
      const numA = parseInt(dayA.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(dayB.match(/\d+/)?.[0] || '0', 10);
      if (numA !== numB) return numA - numB;
      return dayA.localeCompare(dayB);
    });
  }, [processedWords, isShuffle]);

  // TTS helper
  const handleSpeak = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for better learning
      
      utterance.onstart = () => setSpeakingWordId(id);
      utterance.onend = () => setSpeakingWordId(null);
      utterance.onerror = () => setSpeakingWordId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle reveal for individual fields
  const toggleIndividualReveal = (wordId: string, field: 'english' | 'korean') => {
    setIndividualReveals((prev) => {
      const current = prev[wordId] || {};
      return {
        ...prev,
        [wordId]: {
          ...current,
          [field]: !current[field],
        },
      };
    });
  };

  const handleToggleKnown = (wordId: string) => {
    if (knownWordIds.includes(wordId)) {
      onRemoveKnownWord(wordId);
    } else {
      onAddKnownWord(wordId);
    }
  };

  const clearSearch = () => setSearchQuery('');

  // Helper to render a single word card
  const renderWordItem = (word: Word) => {
    const isKnown = knownWordIds.includes(word.id);
    
    // Determine visibility of English
    const isEnglishHidden = hideMode === 'english' && !individualReveals[word.id]?.english;
    // Determine visibility of Korean
    const isKoreanHidden = hideMode === 'korean' && !individualReveals[word.id]?.korean;

    return (
      <div
        key={word.id}
        className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
          isKnown
            ? 'bg-gray-50/50 border-gray-100/70 text-gray-400'
            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Checkbox to Toggle Known */}
          <button
            onClick={() => handleToggleKnown(word.id)}
            className={`flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all cursor-pointer ${
              isKnown
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                : 'border-gray-200 text-transparent hover:border-blue-400'
            }`}
          >
            <Check size={14} strokeWidth={3} className={isKnown ? 'scale-100' : 'scale-0'} />
          </button>

          {/* Word content */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 flex-1 min-w-0">
            {/* English Word */}
            <div className="flex items-center gap-2 min-w-[160px]">
              {isEnglishHidden ? (
                <button
                  onClick={() => toggleIndividualReveal(word.id, 'english')}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <EyeOff size={13} /> 단어 보기
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => hideMode === 'english' && toggleIndividualReveal(word.id, 'english')}
                    className={`text-lg font-bold tracking-tight cursor-pointer ${
                      isKnown ? 'line-through text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {word.english}
                  </span>
                  <button
                    onClick={(e) => handleSpeak(e, word.english, word.id)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                      speakingWordId === word.id ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="발음 듣기"
                  >
                    <Volume2 size={16} className={speakingWordId === word.id ? 'animate-bounce' : ''} />
                  </button>
                </div>
              )}
            </div>

            {/* Divider (Desktop only) */}
            <div className="hidden sm:block h-4 w-px bg-gray-200" />

            {/* Korean Meaning */}
            <div className="flex-1 min-w-0">
              {isKoreanHidden ? (
                <button
                  onClick={() => toggleIndividualReveal(word.id, 'korean')}
                  className="px-3 py-1 text-sm bg-amber-50 text-amber-700 font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <EyeOff size={13} /> 뜻 보기
                </button>
              ) : (
                <span
                  onClick={() => hideMode === 'korean' && toggleIndividualReveal(word.id, 'korean')}
                  className={`text-base font-medium cursor-pointer ${
                    isKnown ? 'text-gray-400 line-through' : 'text-gray-600'
                  }`}
                >
                  {word.korean}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Small Day badge on the right (useful when flat shuffled list) */}
        {isShuffle && (
          <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-500 ml-4">
            {word.day}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 pb-32 px-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            title="학습 메뉴로 돌아가기"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 whitespace-nowrap">그냥 단어장</h2>
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100/50 whitespace-nowrap">
                {selectedDaysLabel}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
              단어를 넘기지 않고 한눈에 스크롤하며 암기할 수 있는 공간입니다.
            </p>
          </div>
        </div>

        {/* Action Toggle controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
              isShuffle
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Shuffle size={15} />
            순서 섞기
          </button>

          <button
            onClick={() => setHideKnown(!hideKnown)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
              hideKnown
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            아는 단어 숨기기
          </button>
        </div>
      </div>

      {/* Control Bar: Search + Hide Modes */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] mb-8 flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="단어 또는 뜻 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-semibold"
            >
              취소
            </button>
          )}
        </div>

        {/* Hide Mode Segmented Controls */}
        <div className="flex bg-gray-100/80 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => {
              setHideMode('none');
              setIndividualReveals({});
            }}
            className={`flex-1 md:flex-none text-center px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              hideMode === 'none' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            모두 보기
          </button>
          <button
            onClick={() => {
              setHideMode('english');
              setIndividualReveals({});
            }}
            className={`flex-1 md:flex-none text-center px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              hideMode === 'english' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            영어 가리기
          </button>
          <button
            onClick={() => {
              setHideMode('korean');
              setIndividualReveals({});
            }}
            className={`flex-1 md:flex-none text-center px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              hideMode === 'korean' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            뜻 가리기
          </button>
        </div>
      </div>

      {/* Info Tip */}
      {(hideMode === 'english' || hideMode === 'korean') && (
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-blue-600 bg-blue-50/50 px-4 py-2.5 rounded-xl border border-blue-100/30 animate-in fade-in duration-300">
          <HelpCircle size={14} />
          <span>가려진 단어나 뜻 상자를 클릭하면 임시로 내용을 확인할 수 있습니다.</span>
        </div>
      )}

      {/* Main List Area */}
      {processedWords.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={44} />
          <p className="text-gray-500 font-semibold text-lg">해당하는 단어가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-1">선택 일차를 늘리거나 검색어를 다르게 입력해보세요.</p>
        </div>
      ) : isShuffle ? (
        // Flat list view for shuffled mode
        <div className="flex flex-col gap-3">
          {processedWords.map(renderWordItem)}
        </div>
      ) : (
        // Grouped by day view
        <div className="flex flex-col gap-10">
          {groupedWords?.map(([day, words]) => (
            <div key={day} className="flex flex-col gap-3">
              {/* Sticky day header */}
              <div className="flex items-center gap-3 sticky top-16 bg-gray-50/90 py-2.5 backdrop-blur-md z-10">
                <h3 className="text-xl font-bold tracking-tight text-gray-800">{day}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                  {words.length} 단어
                </span>
              </div>

              {/* Day words */}
              <div className="flex flex-col gap-3">
                {words.map(renderWordItem)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
