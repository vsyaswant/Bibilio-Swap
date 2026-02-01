
import React, { useState } from 'react';
import { Book } from '../types';

interface LandingPageProps {
  onJoin: () => void;
  featuredBooks: Book[];
}

const LandingPage: React.FC<LandingPageProps> = ({ onJoin, featuredBooks }) => {
  const [zip, setZip] = useState('');

  const hotspots = [
    { name: 'Gachibowli', count: 450 },
    { name: 'Jubilee Hills', count: 320 },
    { name: 'Kondapur', count: 280 },
    { name: 'Financial District', count: 510 },
  ];

  const spotlights = [
    { title: 'Tech & Upskilling', desc: 'Kubernetes, System Design, PM', icon: '💻' },
    { title: 'Kids Academic', desc: 'IB, ICSE, CBSE & Olympiad Prep', icon: '🎓' },
    { title: 'Regional Classics', desc: 'Telugu & Urdu Literature', icon: '🏛️' },
    { title: 'Competitive Exams', desc: 'UPSC, GRE, GMAT materials', icon: '📚' },
  ];

  return (
    <div className="bg-white">
      {/* Hyper-Local Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover" alt="Luxury Community" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase">Verified Neighbors Only</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Your community’s library, <br/>
            <span className="text-indigo-400">from My Home to MyScape.</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Exclusive to Hyderabad’s premier gated communities. Browse books within your society walls or just across the block in Financial District.
          </p>
          
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 shadow-2xl rounded-2xl p-2 bg-white/10 backdrop-blur-xl border border-white/20">
            <input 
              type="text" 
              placeholder="Your Society or Zip Code" 
              className="flex-grow px-4 py-3 rounded-xl bg-transparent focus:outline-none text-white placeholder-white/50"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
            <button 
              onClick={onJoin}
              className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all whitespace-nowrap"
            >
              See Books Nearby
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {hotspots.map(h => (
              <div key={h.name} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="text-indigo-400 font-bold text-xl">{h.count}+</div>
                <div className="text-slate-400 text-xs uppercase tracking-tighter">{h.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className="py-12 bg-indigo-50 border-b border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl">🛡️</div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Verified Neighbors Only</h3>
              <p className="text-sm text-slate-500">Access gated via society invite or gate-pass verification.</p>
            </div>
          </div>
          <div className="h-px w-full md:w-px md:h-12 bg-indigo-200"></div>
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl">🤝</div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Clubhouse Exchanges</h3>
              <p className="text-sm text-slate-500">Secure drop-offs at society security or cafe lounges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Localized Spotlights */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Curated for the Modern Professional</h2>
            <p className="text-slate-500 mt-2">Discover what Gachibowli’s tech-savvy readers are sharing.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {spotlights.map(s => (
              <div key={s.title} className="p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{s.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Community Feed Preview */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Recently Added in My Home Abhra</h2>
              <p className="text-slate-500">Join your society's private shelf to see more.</p>
            </div>
            <button onClick={onJoin} className="text-indigo-600 font-bold hover:underline">View Society Library →</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {featuredBooks.slice(0, 6).map((book, i) => (
              <div key={book.id + i} className="group cursor-pointer">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all group-hover:-translate-y-2 mb-4 ring-1 ring-slate-200">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm truncate">{book.title}</h4>
                <div className="flex items-center mt-1">
                   <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter mr-2">{book.language || 'English'}</span>
                   <p className="text-slate-400 text-xs truncate">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-indigo-950 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden text-center">
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
             <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Redefining local reading.</h2>
               <p className="text-xl text-indigo-200 mb-10 max-w-xl mx-auto">Join the exclusive community of 5,000+ Hyderabad residents sharing their love for books.</p>
               <button 
                 onClick={onJoin}
                 className="bg-white text-indigo-900 px-12 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
               >
                 Join the Society
               </button>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
