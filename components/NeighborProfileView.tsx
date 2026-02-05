
import React from 'react';
import { UserProfile } from '../types';
import BookCard from './BookCard';

interface NeighborProfileViewProps {
  user: UserProfile;
  onBack: () => void;
}

const NeighborProfileView: React.FC<NeighborProfileViewProps> = ({ user, onBack }) => {
  return (
    <div className="py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-black uppercase tracking-widest">Back to Neighbors</span>
      </button>

      {/* Profile Header Card */}
      <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-100 overflow-hidden ring-8 ring-slate-50 shadow-xl">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-grow text-center md:text-left space-y-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full mb-3">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Resident</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
              <p className="text-lg text-indigo-600 font-bold">{user.society}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                <span className="block text-xl font-black text-slate-900 leading-none">{user.library.length}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Books Shared</span>
              </div>
              <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                <span className="block text-xl font-black text-slate-900 leading-none">12</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Successful Trades</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              Send Message
            </button>
            <button className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all active:scale-95">
              Propose Trade
            </button>
          </div>
        </div>
      </section>

      {/* Bookshelf Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Public Bookshelf</h2>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Shared for Community Lending</div>
        </div>

        {user.library.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center shadow-sm">
            <p className="text-slate-500">This neighbor hasn't added any books to their public shelf yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {user.library.map(book => (
              <BookCard key={book.id} book={book} isReadOnly />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NeighborProfileView;
