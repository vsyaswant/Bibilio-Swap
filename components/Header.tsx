
import React from 'react';

interface HeaderProps {
  currentView: 'library' | 'discover' | 'friends';
  setView: (view: 'library' | 'discover' | 'friends') => void;
  userName: string;
  societyName?: string;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, userName, societyName }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('library')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 block leading-none">BiblioSwap</span>
            {societyName && <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{societyName}</span>}
          </div>
        </div>

        <nav className="hidden md:flex space-x-10">
          <button
            onClick={() => setView('library')}
            className={`text-sm font-bold transition-colors ${currentView === 'library' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            Clubhouse
          </button>
          <button
            onClick={() => setView('discover')}
            className={`text-sm font-bold transition-colors ${currentView === 'discover' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            Community Shelf
          </button>
          <button
            onClick={() => setView('friends')}
            className={`text-sm font-bold transition-colors ${currentView === 'friends' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            Neighbors
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <span className="block text-sm font-bold text-slate-900 leading-none">{userName}</span>
            <span className="text-[10px] text-slate-400 font-medium">Verified Resident</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-200 overflow-hidden ring-2 ring-indigo-50 border border-white">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
