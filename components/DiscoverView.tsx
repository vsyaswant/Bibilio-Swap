
import React from 'react';
import { UserProfile, ReadingStatus } from '../types';
import BookCard from './BookCard';

interface DiscoverViewProps {
  otherUsers: UserProfile[];
}

const DiscoverView: React.FC<DiscoverViewProps> = ({ otherUsers }) => {
  const publicUsers = otherUsers.filter(u => u.privacy === 'Public');

  return (
    <div className="space-y-12 py-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Community Shelf</h1>
        <p className="text-slate-500">Explore libraries shared by the Shelf2Street community. Connect with other readers and discover your next favorite book.</p>
      </div>

      {publicUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No public libraries yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-1">Check back later or invite friends to join and share their reading lists.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {publicUsers.map(user => (
            <section key={user.id} className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-4 ring-indigo-50 bg-white">
                   <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{user.name}'s Collection</h2>
                  <p className="text-sm text-slate-500">{user.library.length} books • Member since 2024</p>
                </div>
                <button className="ml-auto bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                  View Profile
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {user.library.slice(0, 5).map(book => (
                  <BookCard key={book.id} book={book} isReadOnly />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverView;