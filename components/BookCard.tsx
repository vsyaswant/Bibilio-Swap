
import React from 'react';
import { Book, ReadingStatus, BookCondition } from '../types';

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

  const conditionColors = {
    [BookCondition.NEW]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    [BookCondition.GOOD]: 'bg-sky-100 text-sky-800 border-sky-200',
    [BookCondition.VINTAGE]: 'bg-amber-100 text-amber-800 border-amber-200',
    [BookCondition.WORN]: 'bg-slate-200 text-slate-700 border-slate-300',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full group">
      <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Cover</div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm border ${conditionColors[book.condition || BookCondition.GOOD]}`}>
            {book.condition || 'Good'}
          </div>
          <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm ${statusColors[book.status]}`}>
            {book.status}
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-black text-slate-900 line-clamp-1 mb-0.5" title={book.title}>{book.title}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">{book.author}</p>
        
        {book.conditionNote && (
          <div className="mb-3 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
            <p className="text-[10px] text-slate-500 italic leading-snug">
              <span className="font-bold uppercase text-[8px] not-italic text-slate-400 mr-1">Condition:</span>
              {book.conditionNote}
            </p>
          </div>
        )}

        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4">{book.summary}</p>
        
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            {book.genre}
          </span>
          
          {!isReadOnly && (
            <div className="flex items-center space-x-2">
              <select 
                className="text-[10px] font-bold border-none bg-slate-50 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                value={book.status}
                onChange={(e) => onStatusChange?.(book.id, e.target.value as ReadingStatus)}
              >
                {Object.values(ReadingStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button 
                onClick={() => onDelete?.(book.id)}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Remove Book"
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
