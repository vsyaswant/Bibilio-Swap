
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
    name: 'Sarah Chen',
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
    name: 'Marcus Thorne',
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
    name: 'Priya Reddy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    privacy: PrivacyMode.PUBLIC,
    friends: [],
    society: 'My Home Bhooja',
    library: [
      {
        id: 'b4',
        title: 'Atomic Habits',
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
        coverUrl: 'https://picsum.photos/seed/alchemist/400/600',
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
    fromUser: 'Rahul (Tech Circle)', 
    status: 'approved', 
    type: 'incoming',
    dropOffNote: 'Left at Gate 2 Security Kiosk'
  },
  { 
    id: 't2', 
    bookTitle: 'Telugu Mahasabhalu', 
    fromUser: 'Srinivas', 
    status: 'pending', 
    type: 'outgoing',
    dropOffNote: 'Meeting at Clubhouse Cafe @ 7PM'
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
  const [recommendations, setRecommendations] = useState<{book: Book, reason: string}[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('biblio_user');
    return saved ? JSON.parse(saved) : {
      id: 'me',
      name: 'Alex Reader',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex',
      privacy: PrivacyMode.PUBLIC,
      friends: ['user-2'], 
      library: [],
      location: 'Gachibowli, Hyderabad',
      society: 'My Home Abhra'
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
          .map(b => b.title);
        const past = userProfile.library
          .filter(b => b.status === ReadingStatus.PAST)
          .sort((a, b) => b.addedAt - a.addedAt)
          .slice(0, 2)
          .map(b => b.title);

        if (current.length > 0 || past.length > 0) {
          const rawRecs = await getBookRecommendations({ current, past }, featuredBooks);
          const mappedRecs = rawRecs.map((r: any) => ({
            book: featuredBooks.find(b => b.id === r.bookId),
            reason: r.reason
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
              
              {/* Recommendations Rail - AI Powered */}
              {recommendations.length > 0 && (
                <section className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                      <div className="flex items-center space-x-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15 10a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Clubhouse Curated</span>
                      </div>
                   </div>
                   <h2 className="text-xl font-black text-slate-900 mb-6">Personalized Selections</h2>
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
