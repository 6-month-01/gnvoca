import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, RefreshCcw } from 'lucide-react';
import type { Word } from '../types';

interface StudyViewProps {
  currentWord: Word | null;
  isRevealed: boolean;
  currentIndex: number;
  totalWords: number;
  isFinished: boolean;
  onNext: () => void;
  onMarkKnown: () => void;
  onExit: () => void;
}

export function StudyView({
  currentWord,
  isRevealed,
  currentIndex,
  totalWords,
  isFinished,
  onNext,
  onMarkKnown,
  onExit,
}: StudyViewProps) {
  const [isEnglishFirst, setIsEnglishFirst] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in some input (though there shouldn't be any here)
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onNext();
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        onMarkKnown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onMarkKnown]);

  if (isFinished || !currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          학습 완료!
        </h2>
        <p className="text-gray-500 mb-12 text-lg">
          오늘 선택한 분량의 단어를 모두 학습했습니다!
        </p>
        <button
          onClick={onExit}
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-md"
        >
          학습 메뉴로 돌아가기
        </button>
      </div>
    );
  }

  const primaryText = isEnglishFirst ? currentWord.english : currentWord.korean;
  const secondaryText = isEnglishFirst ? currentWord.korean : currentWord.english;

  return (
    <div className="max-w-2xl mx-auto pt-8 pb-32 px-6 flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={onExit}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          학습 종료 (나가기)
        </button>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsEnglishFirst(!isEnglishFirst)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors p-2 -m-2 rounded-lg"
            title="언어 순서 변경"
          >
            <RefreshCcw size={16} />
            {isEnglishFirst ? '영어 → 한국어' : '한국어 → 영어'}
          </button>
          <div className="text-sm font-semibold tracking-wide text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {currentIndex + 1} / {totalWords}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div
        onClick={onNext}
        className="flex-1 flex flex-col justify-center items-center text-center cursor-pointer group"
      >
        <div className="min-h-[200px] flex flex-col justify-center items-center w-full">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-gray-900 mb-8 transition-all duration-300">
            {primaryText}
          </h1>

          <div
            className={`
              w-full max-w-md transition-all ease-[cubic-bezier(0.23,1,0.32,1)]
              ${isRevealed ? 'opacity-100 translate-y-0 duration-500' : 'opacity-0 translate-y-4 pointer-events-none duration-0'}
            `}
          >
            <div className="h-px bg-gray-200 w-full mb-8" />
            <h2 className="text-4xl sm:text-5xl font-medium text-blue-600 tracking-tight">
              {secondaryText}
            </h2>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-center gap-4 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onMarkKnown(); }}
          className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 hover:text-gray-900 transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
        >
          아는 단어 처리 <span className="hidden sm:inline-block ml-2 text-xs opacity-50 border border-gray-300 rounded px-1.5 py-0.5">K</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none"
        >
          {isRevealed ? '다음 단어' : '정답 확인'}
          <ArrowRight size={20} />
          <span className="hidden sm:inline-block ml-2 text-xs opacity-50 border border-blue-400 rounded px-1.5 py-0.5">Space</span>
        </button>
      </div>
    </div>
  );
}
