
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BookCard from './components/BookCard';
import BookScanner from './components/BookScanner';
import DiscoverView from './components/DiscoverView';
import { Book, UserProfile, ReadingStatus, PrivacyMode, Friend } from './types';

// Mock data for other users
const MOCK_OTHER_USERS: UserProfile[] = [
  {
    id: 'user-2',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    privacy: PrivacyMode.PUBLIC,
    friends: [],
    library: [
      {
        id: 'b1',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        genre: 'Sci-Fi',
        summary: 'A lone astronaut must save the Earth from an extinction-level threat.',
        coverUrl: 'https://picsum.photos/seed/hailmary/400/600',
        status: ReadingStatus.PAST,
        addedAt: Date.now()
      },
      {
        id: 'b2',
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        genre: 'Fiction',
        summary: 'The story of two childhood friends who become creative partners in the world of video game design.',
        coverUrl: 'https://picsum.photos/seed/tomorrow/400/600',
        status: ReadingStatus.CURRENT,
        addedAt: Date.now()
      }
    ]
  },
  {
    id: 'user-3',
    name: 'Marcus Thorne',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    privacy: PrivacyMode.PUBLIC,
    friends: [],
    library: [
      {
        id: 'b3',
        title: 'Dune',
        author: 'Frank Herbert',
        genre: 'Sci-Fi',
        summary: 'Set in the distant future amidst a huge interstellar empire, where a young noble becomes a messiah.',
        coverUrl: 'https://picsum.photos/seed/dune/400/600',
        status: ReadingStatus.OWNED,
        addedAt: Date.now()
      }
    ]
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'library' | 'discover' | 'friends'>('library');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | 'All'>('All');
  
  // Persisted state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('biblio_user');
    return saved ? JSON.parse(saved) : {
      id: 'me',
      name: 'Alex Reader',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex',
      privacy: PrivacyMode.PUBLIC,
      friends: ['user-2'], // Alex is friends with Sarah
      library: []
    };
  });

  useEffect(() => {
    localStorage.setItem('biblio_user', JSON.stringify(userProfile));
  }, [userProfile]);

  const filteredBooks = useMemo(() => {
    if (activeFilter === 'All') return userProfile.library;
    return userProfile.library.filter(b => b.status === activeFilter);
  }, [userProfile.library, activeFilter]);

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
    };

    setUserProfile(prev => ({
      ...prev,
      library: [newBook, ...prev.library]
    }));
    setIsScannerOpen(false);
  };

  const handleStatusChange = (bookId: string, newStatus: ReadingStatus) => {
    setUserProfile(prev => ({
      ...prev,
      library: prev.library.map(b => b.id === bookId ? { ...b, status: newStatus } : b)
    }));
  };

  const handleDeleteBook = (bookId: string) => {
    if (confirm("Remove this book from your library?")) {
      setUserProfile(prev => ({
        ...prev,
        library: prev.library.filter(b => b.id !== bookId)
      }));
    }
  };

  const togglePrivacy = () => {
    setUserProfile(prev => ({
      ...prev,
      privacy: prev.privacy === PrivacyMode.PUBLIC ? PrivacyMode.PRIVATE : PrivacyMode.PUBLIC
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentView={view} setView={setView} userName={userProfile.name} />

      <main className="flex-grow max-w-6xl mx-auto px-4 w-full">
        {view === 'library' && (
          <div className="py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-3xl font-extrabold text-slate-900">Your Library</h1>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${userProfile.privacy === PrivacyMode.PUBLIC ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                    {userProfile.privacy}
                  </span>
                </div>
                <p className="text-slate-500">Manage your collection, reading progress, and rentals.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={togglePrivacy}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center space-x-2"
                >
                  {userProfile.privacy === PrivacyMode.PUBLIC ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg><span>Make Private</span></>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a10.003 10.003 0 008.384-4.51m-2.408-4.46A10.003 10.003 0 0112 15c-3.177 0-6.156-1.475-8.126-3.844m16.252 0c.053.051.106.102.16.152M5.5 5.5l13 13" /></svg><span>Make Public</span></>
                  )}
                </button>
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add New Book</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', ...Object.values(ReadingStatus)].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredBooks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your shelf is empty</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">Start building your digital library by scanning your physical books. It's the best way to track and share your reading journey.</p>
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Scan your first book
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredBooks.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteBook}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'discover' && <DiscoverView otherUsers={MOCK_OTHER_USERS} />}

        {view === 'friends' && (
          <div className="py-8 space-y-8">
             <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Friends</h1>
              <p className="text-slate-500">Keep up with what your inner circle is reading. Private libraries are only visible to confirmed friends.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_OTHER_USERS.map(friend => {
                const isFriend = userProfile.friends.includes(friend.id);
                return (
                  <div key={friend.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-6">
                    <img src={friend.avatar} alt={friend.name} className="w-16 h-16 rounded-full ring-4 ring-indigo-50" />
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-slate-900">{friend.name}</h3>
                      <p className="text-sm text-slate-500">{friend.library.length} Books in Collection</p>
                    </div>
                    <button 
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isFriend ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white'}`}
                    >
                      {isFriend ? 'Message' : 'Add Friend'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {isScannerOpen && (
        <BookScanner 
          onBookDetected={handleBookDetected} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}

      <footer className="mt-auto py-12 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <p>© 2024 BiblioSwap. Empowering readers to share and connect.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
