import { Trash2, ArrowLeft } from 'lucide-react';
import type { Word } from '../types';

interface KnownWordsViewProps {
  knownWordIds: string[];
  allWords: Word[];
  onRemoveKnownWord: (id: string) => void;
  onBack: () => void;
}

export function KnownWordsView({ knownWordIds, allWords, onRemoveKnownWord, onBack }: KnownWordsViewProps) {
  
  const knownWords = knownWordIds
    .map(id => allWords.find(w => w.id === id))
    .filter((w): w is Word => w !== undefined);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
            아는 단어장
          </h2>
          <p className="text-gray-500 font-medium text-sm mt-1">
            총 {knownWords.length}개의 단어를 완벽히 외우셨습니다. 이 단어들은 학습에서 제외됩니다.
          </p>
        </div>
      </div>

      {knownWords.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">아직 외운 단어가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">학습 중 'K' 키를 누르면 아는 단어로 추가됩니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
            {knownWords.map((word) => (
              <li
                key={word.id}
                className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-semibold text-gray-900">{word.english}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                      {word.day}
                    </span>
                  </div>
                  <div className="text-gray-600 font-medium">{word.korean}</div>
                </div>
                <button
                  onClick={() => onRemoveKnownWord(word.id)}
                  className="text-gray-300 bg-white shadow-sm border border-gray-200 p-2.5 rounded-xl hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                  title="아는 단어 목록에서 제외"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
