
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BookCard from './components/BookCard';
import BookScanner from './components/BookScanner';
import DiscoverView from './components/DiscoverView';
import LandingPage from './components/LandingPage';
import AuthView from './components/AuthView';
import NeighborProfileView from './components/NeighborProfileView';
import { getBookRecommendations, parseRecoCSV, RECO_CSV_CONTENT, getGoogleBooksMetadata } from './services/geminiService';
import { Book, UserProfile, ReadingStatus, PrivacyMode, TradeRequest } from './types';

// Updated Mock Data
const MOCK_OTHER_USERS: UserProfile[] = [
  {
    id: 'user-2',
    name: 'Vinay',
    avatar: 'https://cinetown.s3.ap-south-1.amazonaws.com/people/profile_img/1700245733.jpeg',
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
        summary: 'Story of two childhood friends in game design.',
        coverUrl: 'https://picsum.photos/seed/tomorrow/400/600',
        status: ReadingStatus.CURRENT,
        addedAt: Date.now(),
        language: 'English'
      }
    ]
  },
  {
    id: 'user-3',
    name: 'Stutee',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Morpho_menelaus_menelaus_MHNT_dos.jpg/800px-Morpho_menelaus_menelaus_MHNT_dos.jpg',
    privacy: PrivacyMode.PUBLIC,
    friends: [],
    society: 'Lansum Etania',
    library: [
      {
        id: 'b3',
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Sci-Fi',
        summary: 'Interstellar empire epic.',
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
    avatar: 'https://media.tenor.com/stwgJVcmA6QAAAAe/funny-memes-telugu-telugu-dialogues.png',
    privacy: PrivacyMode.PUBLIC,
    friends: [],
    society: 'Trishala Saffron Elite',
    library: [
      {
        id: 'b4',
        title: 'Naa Saavedo nen sastha neekenduku',
        author: 'Kaushik',
        genre: 'Self-Help',
        summary: 'A tiny changes, remarkable results strategy for habit formation.',
        coverUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2cGw-Rof73vL4ToyGGt1NS_McIjFn4FQpFQ&s',
        status: ReadingStatus.OWNED,
        addedAt: Date.now(),
        language: 'Telugu'
      },
      {
        id: 'b5',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        genre: 'Fiction',
        summary: 'Follow your dream fable.',
        coverUrl: 'https://images.squarespace-cdn.com/content/v1/59de8d6fbebafb493794e056/1558530073213-OP51JP2VJ1CJOY7SVQX1/The-Alchemist-Paulo-Coelho-25th-Anniversary-Edition.jpg?format=1500w',
        status: ReadingStatus.OWNED,
        addedAt: Date.now(),
        language: 'English'
      }
    ]
  }
];

const MOCK_TRADES: TradeRequest[] = [
  { id: 't1', bookTitle: 'Cracking the PM Interview', fromUser: 'Vinay', status: 'approved', type: 'incoming', dropOffNote: 'Left at Gate 2' },
  { id: 't2', bookTitle: 'Atomic Habits', fromUser: 'Nikhil', status: 'pending', type: 'outgoing', dropOffNote: 'Meeting at Clubhouse' }
];

const App: React.FC = () => {
  const [authStep, setAuthStep] = useState<'landing' | 'login' | 'signup' | 'authenticated'>(() => {
    return localStorage.getItem('biblio_auth') === 'true' ? 'authenticated' : 'landing';
  });
  const [view, setView] = useState<'library' | 'discover' | 'friends' | 'neighbor_profile'>('library');
  const [selectedNeighborId, setSelectedNeighborId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | 'All'>('All');
  const [languageFilter, setLanguageFilter] = useState<'All' | 'English' | 'Telugu' | 'Hindi'>('All');
  const [recommendations, setRecommendations] = useState<{book: Book, reason: string, sourceType: string}[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [neighbors, setNeighbors] = useState<UserProfile[]>(MOCK_OTHER_USERS);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('biblio_user');
    return saved ? JSON.parse(saved) : {
      id: 'me',
      name: 'Dheeraj Reddy Banda',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Dheeraj',
      privacy: PrivacyMode.PUBLIC,
      friends: ['user-2', 'user-3', 'user-4'], 
      library: [],
      society: 'Niharika Interlake'
    };
  });

  const csvBooks = useMemo(() => parseRecoCSV(RECO_CSV_CONTENT), []);

  const friendsBooks = useMemo(() => {
    return neighbors
      .filter(u => userProfile.friends.includes(u.id))
      .flatMap(u => u.library.map(b => ({ ...b, ownerName: u.name })));
  }, [userProfile.friends, neighbors]);

  // Initial Cover Hydration - Replace placeholders with real covers
  useEffect(() => {
    const hydrateCovers = async () => {
      // 1. Hydrate User Library
      const hydrateList = async (list: Book[]) => {
        return Promise.all(list.map(async (book) => {
          if (book.coverUrl.includes('picsum.photos')) {
            const meta = await getGoogleBooksMetadata(book.title, book.author);
            if (meta?.coverUrl) return { ...book, coverUrl: meta.coverUrl };
          }
          return book;
        }));
      };

      if (userProfile.library.length > 0) {
        const newLib = await hydrateList(userProfile.library);
        setUserProfile(prev => ({ ...prev, library: newLib }));
      }

      // 2. Hydrate Neighbors
      const newNeighbors = await Promise.all(neighbors.map(async (neighbor) => {
        const newLib = await hydrateList(neighbor.library);
        return { ...neighbor, library: newLib };
      }));
      setNeighbors(newNeighbors);
    };

    if (authStep === 'authenticated') {
      hydrateCovers();
    }
  }, [authStep]);

  useEffect(() => {
    if (authStep === 'authenticated') {
      const fetchRecs = async () => {
        setIsRecLoading(true);
        const current = userProfile.library
          .filter(b => b.status === ReadingStatus.CURRENT)
          .map(b => ({ title: b.title, genre: b.genre }));
        const past = userProfile.library
          .filter(b => b.status === ReadingStatus.PAST)
          .sort((a, b) => b.addedAt - a.addedAt)
          .slice(0, 5)
          .map(b => ({ title: b.title, genre: b.genre }));

        const ownedTitles = userProfile.library.map(b => b.title);

        if (current.length > 0 || past.length > 0 || userProfile.library.length > 0) {
          const rawRecs = await getBookRecommendations({ current, past }, csvBooks, friendsBooks, ownedTitles);
          const allPool = [...friendsBooks, ...csvBooks];
          
          const mappedRecs = rawRecs.map((r: any) => ({
            book: allPool.find(b => b.id === r.bookId),
            reason: r.reason,
            sourceType: r.sourceType
          })).filter((r: any) => r.book);
          
          setRecommendations(mappedRecs);
        }
        setIsRecLoading(false);
      };
      fetchRecs();
    }
  }, [userProfile.library, csvBooks, friendsBooks, authStep]);

  const filteredBooks = useMemo(() => {
    let books = userProfile.library;
    if (activeFilter !== 'All') books = books.filter(b => b.status === activeFilter);
    if (languageFilter !== 'All') books = books.filter(b => b.language === languageFilter);
    return books;
  }, [userProfile.library, activeFilter, languageFilter]);

  const handleBookDetected = (bookData: any, coverImage: string, forcedStatus?: ReadingStatus) => {
    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      title: bookData.title || 'Unknown Title',
      author: bookData.author || 'Unknown Author',
      genre: bookData.genre || 'General',
      summary: bookData.summary || 'No summary available.',
      coverUrl: bookData.coverUrl || coverImage,
      status: forcedStatus || ReadingStatus.OWNED,
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

  const openNeighborProfile = (id: string) => {
    setSelectedNeighborId(id);
    setView('neighbor_profile');
  };

  const selectedNeighbor = useMemo(() => {
    return neighbors.find(u => u.id === selectedNeighborId);
  }, [selectedNeighborId, neighbors]);

  if (authStep === 'landing') return <LandingPage onJoin={() => setAuthStep('signup')} onSignIn={() => setAuthStep('login')} featuredBooks={csvBooks} />;
  
  if (authStep === 'login' || authStep === 'signup') {
    return (
      <AuthView 
        mode={authStep} 
        onAuthSuccess={(d) => {
          setUserProfile(p => ({...p, ...d, friends: ['user-2', 'user-3', 'user-4']})); 
          setAuthStep('authenticated');
        }} 
        onToggleMode={() => setAuthStep(authStep === 'login' ? 'signup' : 'login')} 
        onBack={() => setAuthStep('landing')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentView={view === 'neighbor_profile' ? 'friends' : view as any} setView={setView} userName={userProfile.name} societyName={userProfile.society} />
      
      <main className="flex-grow max-w-6xl mx-auto px-4 w-full py-8">
        {view === 'library' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-10">
              
              {/* Recommendations Rail */}
              {(recommendations.length > 0 || isRecLoading) && (
                <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                      <div className="flex items-center space-x-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Neighbor First RAG</span>
                      </div>
                   </div>
                   <h2 className="text-xl font-black text-slate-900 mb-6">Personalized Picks</h2>
                   {isRecLoading ? (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex space-x-4 items-start">
                             <div className="w-20 h-28 bg-slate-100 rounded-lg"></div>
                             <div className="flex-grow space-y-2">
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map((rec, idx) => (
                          <div key={idx} className="flex space-x-4 items-start group">
                             <div className="w-20 h-28 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1">
                                <img src={rec.book.coverUrl} className="w-full h-full object-cover" alt={rec.book.title} />
                             </div>
                             <div className="flex-grow">
                                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{rec.book.title}</h4>
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${rec.sourceType === 'neighbor' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {rec.sourceType === 'neighbor' ? 'Neighbor' : 'Catalog'}
                                  </span>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{rec.book.author}</p>
                                </div>
                                <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/30 text-[10px] text-indigo-700 italic leading-snug">
                                  "{rec.reason}"
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                   )}
                </section>
              )}

              {/* Active Logistics Rail */}
              <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <h2 className="text-2xl font-black mb-6 relative z-10">Active Logistics</h2>
                <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide relative z-10">
                  {MOCK_TRADES.map(trade => (
                    <div key={trade.id} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 min-w-[280px] border border-white/10 group hover:bg-white/10 transition-colors">
                      <div className="flex justify-between mb-3">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${trade.status === 'pending' ? 'bg-amber-400 text-amber-950' : 'bg-green-400 text-green-950'}`}>{trade.status}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{trade.type}</p>
                      </div>
                      <h4 className="font-bold text-base mb-1 truncate">{trade.bookTitle}</h4>
                      <p className="text-xs text-slate-300">Partner: <span className="font-bold text-white">{trade.fromUser}</span></p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Main Shelf */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Bookshelf</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{userProfile.society} Resident Shelf</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsScannerOpen(true)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center space-x-2">
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
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner shadow-indigo-100/50">📚</div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Shelf empty</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm font-medium">Add books you own to trade, or log your reading history to get better recommendations.</p>
                    <button onClick={() => setIsScannerOpen(true)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100">Add First Book</button>
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

            {/* Neighbors Aside */}
            <aside className="space-y-8">
               <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                 <h3 className="font-black text-slate-900 mb-6 uppercase text-[10px] tracking-widest">Active Neighbors</h3>
                 <div className="space-y-6">
                    {neighbors.filter(u => userProfile.friends.includes(u.id)).map((neighbor) => (
                      <div key={neighbor.id} onClick={() => openNeighborProfile(neighbor.id)} className="flex items-center space-x-3 cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-slate-50 group-hover:ring-indigo-100 transition-all">
                          <img src={neighbor.avatar} alt={neighbor.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{neighbor.name}</p>
                          <p className="text-[10px] text-indigo-600 font-bold uppercase">{neighbor.society}</p>
                        </div>
                      </div>
                    ))}
                 </div>
                 <button onClick={() => setView('friends')} className="w-full mt-8 py-3 text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">View All Residents</button>
               </div>
            </aside>
          </div>
        )}

        {view === 'discover' && (
          <div className="space-y-12 py-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Community Shelf</h1>
            <p className="text-slate-500 max-w-2xl -mt-8">Browsing master catalog from community favorites and shared local libraries.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {csvBooks.map(book => <BookCard key={book.id} book={book} isReadOnly />)}
            </div>
          </div>
        )}

        {view === 'friends' && (
          <div className="py-8 space-y-8">
             <div className="max-w-2xl">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verified Neighbors</h1>
              <p className="text-slate-500">Residents in your immediate community circles.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {neighbors.map(friend => (
                <div key={friend.id} onClick={() => openNeighborProfile(friend.id)} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center space-x-6 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex-shrink-0 overflow-hidden border border-slate-100 shadow-sm">
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-black text-xl text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{friend.name}</h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">{friend.society}</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">{friend.library.length || 0} Books</span>
                      <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded font-bold">Verified</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'neighbor_profile' && selectedNeighbor && (
          <NeighborProfileView 
            user={selectedNeighbor} 
            onBack={() => setView('friends')} 
          />
        )}
      </main>

      {isScannerOpen && <BookScanner onBookDetected={handleBookDetected} onClose={() => setIsScannerOpen(false)} />}
    </div>
  );
};

export default App;
