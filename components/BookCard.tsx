
import React from 'react';
import { Book, ReadingStatus } from '../types';

interface BookCardProps {
  book: Book;
  onStatusChange?: (id: string, newStatus: ReadingStatus) => void;
  onDelete?: (id: string) => void;
  isReadOnly?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, onStatusChange, onDelete, isReadOnly = false }) => {
  const statusColors = {
    [ReadingStatus.CURRENT]: 'bg-green-100 text-green-700',
    [ReadingStatus.PAST]: 'bg-slate-100 text-slate-700',
    [ReadingStatus.RENTED]: 'bg-amber-100 text-amber-700',
    [ReadingStatus.OWNED]: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="aspect-[3/4] relative bg-slate-100">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No Cover
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColors[book.status]}`}>
          {book.status}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-900 line-clamp-1" title={book.title}>{book.title}</h3>
        <p className="text-sm text-slate-500 mb-2">{book.author}</p>
        <p className="text-xs text-slate-400 mb-3 line-clamp-2 italic">{book.summary}</p>
        
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {book.genre}
          </span>
          
          {!isReadOnly && (
            <div className="flex space-x-2">
              <select 
                className="text-[10px] border border-slate-200 rounded p-1 focus:ring-1 focus:ring-indigo-500"
                value={book.status}
                onChange={(e) => onStatusChange?.(book.id, e.target.value as ReadingStatus)}
              >
                {Object.values(ReadingStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button 
                onClick={() => onDelete?.(book.id)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
