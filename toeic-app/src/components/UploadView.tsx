import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import type { Word } from '../types';

interface UploadViewProps {
  onUploadSuccess: (words: Word[]) => void;
}

export function UploadView({ onUploadSuccess }: UploadViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileParse = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedWords: Word[] = results.data.map((row: any) => {
            if (!row.Day || !row.English || !row.Korean) {
              throw new Error('CSV missing required headers: Day, English, Korean');
            }
            return {
              id: `${row.Day}_${row.English}`.replace(/\s+/g, ''),
              day: row.Day.trim(),
              english: row.English.trim(),
              korean: row.Korean.trim(),
            };
          });
          onUploadSuccess(parsedWords);
        } catch (err: any) {
          setError(err.message || 'Error processing CSV file.');
        }
      },
      error: () => {
        setError('Failed to read the file.');
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileParse(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      handleFileParse(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in duration-700">
      <div className="text-center mb-12 text-gray-800">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
          TOEIC Vocabulary
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          Upload your vocabulary CSV to begin.
        </p>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full max-w-md p-10 rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300 ease-out flex flex-col items-center gap-6
          ${isHovered ? 'bg-blue-50 border-blue-400 shadow-lg shadow-blue-100' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}
        `}
      >
        <div className={`p-4 rounded-full transition-colors ${isHovered ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
          <Upload size={32} />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-gray-700 mb-1">
            Click to browse or drag here
          </p>
          <p className="text-sm text-gray-400">
            CSV format: Day, English, Korean
          </p>
        </div>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleChange}
        />
      </div>

      {error && (
        <div className="mt-8 px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium animate-in slide-in-from-bottom-2">
          {error}
        </div>
      )}
    </div>
  );
}
