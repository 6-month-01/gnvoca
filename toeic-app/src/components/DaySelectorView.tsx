import { useMemo } from 'react';
import { Play, Check, X, CheckSquare, Square } from 'lucide-react';
import type { Word } from '../types';

interface DaySelectorViewProps {
  allWords: Word[];
  selectedDays: string[];
  onChangeSelectedDays: (days: string[]) => void;
  onStartStudy: () => void;
  onClearData: () => void;
}

export function DaySelectorView({
  allWords,
  selectedDays,
  onChangeSelectedDays,
  onStartStudy,
  onClearData,
}: DaySelectorViewProps) {
  
  // Group days and get counts
  const dayStats = useMemo(() => {
    const stats: Record<string, number> = {};
    allWords.forEach(w => {
      stats[w.day] = (stats[w.day] || 0) + 1;
    });
    return Object.entries(stats).sort(([a], [b]) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
  }, [allWords]);

  const allDays = dayStats.map(([day]) => day);
  const isAllSelected = selectedDays.length === allDays.length && allDays.length > 0;
  
  const totalSelectedWords = allWords.filter(w => selectedDays.includes(w.day)).length;

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChangeSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      onChangeSelectedDays([...selectedDays, day]);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChangeSelectedDays([]);
    } else {
      onChangeSelectedDays(allDays);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 pt-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
            학습 일차 선택
          </h2>
          <p className="text-gray-500 font-medium">
            초기화 버튼을 눌러 데이터를 비울 수 있습니다.
          </p>
        </div>
        <button
          onClick={onClearData}
          className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group"
          title="모든 데이터 삭제"
        >
          <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          데이터 초기화
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
        >
          {isAllSelected ? (
            <><CheckSquare size={16} className="text-blue-500" /> 전체 해제</>
          ) : (
             <><Square size={16} className="text-gray-400" /> 전체 선택</>
          )}
        </button>
        <div className="text-sm font-medium text-gray-500">
          {selectedDays.length}개 선택됨 • 총 {totalSelectedWords}단어
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {dayStats.map(([day, count]) => {
          const isSelected = selectedDays.includes(day);
          return (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`
                relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-start gap-1 text-left
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100/50 scale-[1.02]' 
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}
              `}
            >
              <div className={`font-semibold tracking-tight ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                {day}
              </div>
              <div className={`text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                {count} 단어
              </div>
              {isSelected && (
                <div className="absolute top-4 right-4 text-blue-500 animate-in zoom-in">
                  <Check size={18} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-10 pointer-events-none px-6">
        <button
          onClick={onStartStudy}
          disabled={selectedDays.length === 0}
          className={`
            pointer-events-auto flex items-center gap-3 px-10 py-4 rounded-full text-lg font-semibold tracking-tight transition-all duration-300
            ${selectedDays.length > 0
              ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-1'
              : 'bg-white/90 backdrop-blur-md border border-gray-200 text-gray-400 shadow-lg cursor-not-allowed'
            }
          `}
        >
          학습 시작 <Play fill="currentColor" size={20} />
        </button>
      </div>
    </div>
  );
}
