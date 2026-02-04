
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BookCard from './components/BookCard';
import BookScanner from './components/BookScanner';
import DiscoverView from './components/DiscoverView';
import LandingPage from './components/LandingPage';
import AuthView from './components/AuthView';
import { getBookRecommendations } from './services/geminiService';
import { Book, UserProfile, ReadingStatus, PrivacyMode, TradeRequest } from './types';

// Mock data for other users with society info
const MOCK_OTHER_USERS: UserProfile[] = [
  {
    id: 'user-2',
    name: 'Rahul Singh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    privacy: PrivacyMode.PUBLIC,
    friends: [],
    society: 'My Home Abhra',
    library: [
      {
        id: 'b1',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        genre: 'Sci-Fi',
        summary: 'A lone astronaut must save the Earth from an extinction-level threat.',
        coverUrl: 'https://picsum.photos/seed/hailmary/400/600',
        status: ReadingStatus.PAST,
        addedAt: Date.now(),
        language: 'English'
      },
      {
        id: 'b2',
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        genre: 'Fiction',
        summary: 'The story of two childhood friends who become creative partners in the world of video game design.',
        coverUrl: 'https://picsum.photos/seed/tomorrow/400/600',
        status: ReadingStatus.CURRENT,
        addedAt: Date.now(),
        language: 'English'
      }
    ]
  },
  {
    id: 'user-3',
    name: 'Vinay Mothkur',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    privacy: PrivacyMode.PUBLIC,
    friends: [],
    society: 'Lansum Etania',
    library: [
      {
        id: 'b3',
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Sci-Fi',
        summary: 'Set in the distant future amidst a huge interstellar empire.',
        coverUrl: 'https://picsum.photos/seed/dune/400/600',
        status: ReadingStatus.OWNED,
        addedAt: Date.now(),
        language: 'English'
      }
    ]
  },
  {
    id: 'user-4',
    name: 'Nikhil',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    privacy: PrivacyMode.PUBLIC,
    friends: [],
    society: 'Trishala Saffron Elite',
    library: [
      {
        id: 'b4',
        title: 'Do you think I read books??',
        author: 'James Clear',
        genre: 'Self-Help',
        summary: 'A tiny changes, remarkable results strategy for habit formation.',
        coverUrl: 'https://picsum.photos/seed/atomic/400/600',
        status: ReadingStatus.OWNED,
        addedAt: Date.now(),
        language: 'English'
      },
      {
        id: 'b5',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        genre: 'Fiction',
        summary: 'A fable about following your dream.',
        coverUrl: 'data:image/jpeg;base64,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',
        status: ReadingStatus.OWNED,
        addedAt: Date.now(),
        language: 'English'
      }
    ]
  }
];

const MOCK_TRADES: TradeRequest[] = [
  { 
    id: 't1', 
    bookTitle: 'System Design Interview', 
    fromUser: 'Rahul', 
    status: 'approved', 
    type: 'incoming',
    dropOffNote: 'Left at Gate 2 Security Kiosk'
  },
  { 
    id: 't2', 
    bookTitle: 'Naa Saavu nen saastha neekenduku', 
    fromUser: 'Nikhil', 
    status: 'pending', 
    type: 'outgoing',
    dropOffNote: 'Meeting at Tepoint  @ 4PM'
  }
];

const App: React.FC = () => {
  const [authStep, setAuthStep] = useState<'landing' | 'login' | 'signup' | 'authenticated'>(() => {
    return localStorage.getItem('biblio_auth') === 'true' ? 'authenticated' : 'landing';
  });
  const [view, setView] = useState<'library' | 'discover' | 'friends'>('library');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | 'All'>('All');
  const [languageFilter, setLanguageFilter] = useState<'All' | 'English' | 'Telugu' | 'Hindi'>('All');
  const [recommendations, setRecommendations] = useState<{book: Book, reason: string, genreMatch: string}[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('biblio_user');
    return saved ? JSON.parse(saved) : {
      id: 'me',
      name: 'Dheeraj Reddy Banda',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex',
      privacy: PrivacyMode.PUBLIC,
      friends: ['user-4'], 
      library: [],
      location: 'Gachibowli, Hyderabad',
      society: 'Niharika Interlake'
    };
  });

  useEffect(() => {
    localStorage.setItem('biblio_user', JSON.stringify(userProfile));
    localStorage.setItem('biblio_auth', (authStep === 'authenticated').toString());
  }, [userProfile, authStep]);

  const featuredBooks = useMemo(() => {
    return MOCK_OTHER_USERS.flatMap(u => u.library);
  }, []);

  useEffect(() => {
    if (authStep === 'authenticated' && userProfile.library.length > 0) {
      const fetchRecs = async () => {
        setIsRecLoading(true);
        const current = userProfile.library
          .filter(b => b.status === ReadingStatus.CURRENT)
          .map(b => ({ title: b.title, genre: b.genre }));
        
        const past = userProfile.library
          .filter(b => b.status === ReadingStatus.PAST)
          .sort((a, b) => b.addedAt - a.addedAt)
          .slice(0, 2)
          .map(b => ({ title: b.title, genre: b.genre }));

        if (current.length > 0 || past.length > 0) {
          const rawRecs = await getBookRecommendations({ current, past }, featuredBooks);
          const mappedRecs = rawRecs.map((r: any) => ({
            book: featuredBooks.find(b => b.id === r.bookId),
            reason: r.reason,
            genreMatch: r.genreMatch
          })).filter((r: any) => r.book);
          setRecommendations(mappedRecs);
        }
        setIsRecLoading(false);
      };
      fetchRecs();
    }
  }, [userProfile.library, featuredBooks, authStep]);

  const filteredBooks = useMemo(() => {
    let books = userProfile.library;
    if (activeFilter !== 'All') books = books.filter(b => b.status === activeFilter);
    if (languageFilter !== 'All') books = books.filter(b => b.language === languageFilter);
    return books;
  }, [userProfile.library, activeFilter, languageFilter]);

  const handleBookDetected = (bookData: any, coverImage: string) => {
    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      title: bookData.title || 'Unknown Title',
      author: bookData.author || 'Unknown Author',
      isbn: bookData.isbn,
      genre: bookData.genre || 'General',
      summary: bookData.summary || 'No summary available.',
      coverUrl: coverImage,
      status: ReadingStatus.OWNED,
      addedAt: Date.now(),
      language: 'English'
    };

    setUserProfile(prev => ({ ...prev, library: [newBook, ...prev.library] }));
    setIsScannerOpen(false);
  };

  const handleStatusChange = (bookId: string, newStatus: ReadingStatus) => {
    setUserProfile(prev => ({
      ...prev,
      library: prev.library.map(b => b.id === bookId ? { ...b, status: newStatus } : b)
    }));
  };

  const handleDeleteBook = (bookId: string) => {
    if (confirm("Remove this book?")) {
      setUserProfile(prev => ({
        ...prev,
        library: prev.library.filter(b => b.id !== bookId)
      }));
    }
  };

  const handleAuthSuccess = (userData: { name: string; society: string }) => {
    setUserProfile(prev => ({
      ...prev,
      name: userData.name,
      society: userData.society
    }));
    setAuthStep('authenticated');
  };

  if (authStep === 'landing') {
    return <LandingPage onJoin={() => setAuthStep('signup')} featuredBooks={featuredBooks} />;
  }

  if (authStep === 'login' || authStep === 'signup') {
    return (
      <AuthView 
        mode={authStep} 
        onAuthSuccess={handleAuthSuccess}
        onToggleMode={() => setAuthStep(authStep === 'login' ? 'signup' : 'login')}
        onBack={() => setAuthStep('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentView={view} setView={setView} userName={userProfile.name} societyName={userProfile.society} />

      <main className="flex-grow max-w-6xl mx-auto px-4 w-full py-8">
        {view === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Content Area: Dashboard */}
            <div className="lg:col-span-3 space-y-10">
              
              {/* Recommendations Rail - RAG Augmented AI */}
              {recommendations.length > 0 && (
                <section className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                      <div className="flex items-center space-x-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15 10a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">RAG Optimized</span>
                      </div>
                   </div>
                   <div className="mb-6">
                      <h2 className="text-xl font-black text-slate-900">Personalized Clubhouse Selections</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Based on your recent interest in: {Array.from(new Set(recommendations.map(r => r.genreMatch))).join(', ')}</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="flex space-x-4 items-start group">
                           <div className="w-20 h-28 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1 ring-1 ring-slate-200">
                              <img src={rec.book.coverUrl} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-grow">
                              <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{rec.book.title}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{rec.book.author}</p>
                              <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/30">
                                <p className="text-[10px] text-indigo-700 italic leading-snug">"{rec.reason}"</p>
                              </div>
                              <button className="mt-3 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 flex items-center">
                                Request Trade 
                                <svg className="w-2 h-2 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
              )}

              {/* Active Logistics Rail */}
              <section className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black flex items-center">Clubhouse Exchange</h2>
                    <p className="text-indigo-200 text-sm">Ongoing trades in {userProfile.society}</p>
                  </div>
                  <button className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                  </button>
                </div>
                <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide relative z-10">
                  {MOCK_TRADES.map(trade => (
                    <div key={trade.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 min-w-[280px] border border-white/10 group">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${trade.status === 'pending' ? 'bg-amber-400 text-amber-950' : 'bg-green-400 text-green-950'}`}>
                          {trade.status}
                        </span>
                        <p className="text-[10px] text-indigo-300 font-bold uppercase">{trade.type}</p>
                      </div>
                      <h4 className="font-bold text-base mb-1 truncate">{trade.bookTitle}</h4>
                      <p className="text-xs text-indigo-100 mb-4">Partner: <span className="font-bold">{trade.fromUser}</span></p>
                      {trade.dropOffNote && (
                        <div className="flex items-center space-x-2 text-[10px] bg-white/5 p-2 rounded-lg italic text-indigo-200">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          <span className="truncate">{trade.dropOffNote}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Shelf Controls & Library */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Bookshelf</h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{userProfile.society}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Resident Library</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                     <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {['All', 'English', 'Telugu'].map(lang => (
                          <button 
                            key={lang}
                            onClick={() => setLanguageFilter(lang as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${languageFilter === lang ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            {lang}
                          </button>
                        ))}
                     </div>
                    <button 
                      onClick={() => setIsScannerOpen(true)}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      <span>Add Book</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {['All', ...Object.values(ReadingStatus)].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter as any)}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {filteredBooks.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">📚</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Shelf empty</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm">Start scanning books to join the {userProfile.society} community circle.</p>
                    <button onClick={() => setIsScannerOpen(true)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100">Open Scanner</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBooks.map(book => (
                      <BookCard key={book.id} book={book} onStatusChange={handleStatusChange} onDelete={handleDeleteBook} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Clubhouse Community */}
            <aside className="space-y-8">
               <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                 <h3 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Society Leaderboard</h3>
                 <div className="space-y-6">
                    {[
                      { name: 'Srinivas R.', count: 124, icon: '🥇' },
                      { name: 'Sarah Chen', count: 98, icon: '🥈' },
                      { name: 'Rahul V.', count: 45, icon: '🥉' }
                    ].map((leader, i) => (
                      <div key={leader.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{leader.icon}</span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{leader.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">{leader.count} Books Shared</p>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <button className="w-full mt-8 py-3 text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">View All Residents</button>
               </div>

               <div className="bg-amber-500 rounded-[2rem] p-8 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-xs uppercase tracking-widest">Kids Academic Hub</h4>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">New</span>
                  </div>
                  <p className="text-xs text-indigo-100 mb-6 leading-relaxed">Exchange IB, ICSE & Olympiad prep materials with other parents in {userProfile.society}.</p>
                  <div className="flex -space-x-3 mb-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-12 h-16 rounded-lg bg-white border-2 border-amber-500 shadow-xl overflow-hidden">
                        <img src={`https://picsum.photos/seed/kidsbook${i}/100/150`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-12 h-16 rounded-lg bg-amber-600 border-2 border-amber-500 shadow-xl flex items-center justify-center text-[10px] font-bold">+24</div>
                  </div>
                  <button className="w-full py-3 bg-white text-amber-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber-50 transition-all">Explore Hub</button>
               </div>

               <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
                  <h4 className="font-black text-xs uppercase tracking-widest mb-4">Book-Pool: Startup Circle</h4>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">Exclusive collection shared by entrepreneurs in {userProfile.society}.</p>
                  <div className="flex -space-x-3 mb-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-16 rounded-lg bg-slate-800 border-2 border-slate-900 shadow-xl overflow-hidden">
                        <img src={`https://picsum.photos/seed/tech${i}/100/150`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-12 h-16 rounded-lg bg-indigo-600 border-2 border-slate-900 shadow-xl flex items-center justify-center text-[10px] font-bold">+12</div>
                  </div>
                  <button className="w-full py-3 bg-white text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">Join Pool</button>
               </div>
            </aside>
          </div>
        )}

        {view === 'discover' && <DiscoverView otherUsers={MOCK_OTHER_USERS} />}

        {view === 'friends' && (
          <div className="py-8 space-y-8">
             <div className="max-w-2xl">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verified Neighbors</h1>
              <p className="text-slate-500">Connecting with the residents of {userProfile.society}.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_OTHER_USERS.map(friend => (
                <div key={friend.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center space-x-6 hover:shadow-lg transition-shadow">
                  <img src={friend.avatar} alt={friend.name} className="w-16 h-16 rounded-2xl ring-4 ring-indigo-50" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-slate-900">{friend.name}</h3>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{friend.society}</p>
                  </div>
                  <button className="px-6 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">Message</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {isScannerOpen && (
        <BookScanner onBookDetected={handleBookDetected} onClose={() => setIsScannerOpen(false)} />
      )}

      <footer className="mt-auto py-12 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2024 BiblioSwap. Verified Society Platform.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <button onClick={() => setAuthStep('landing')} className="text-red-400 hover:text-red-500 transition-colors">Terminate Session</button>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Rules</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
