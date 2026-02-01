
import React, { useState } from 'react';

interface AuthViewProps {
  mode: 'login' | 'signup';
  onAuthSuccess: (userData: any) => void;
  onToggleMode: () => void;
  onBack: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ mode, onAuthSuccess, onToggleMode, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [society, setSociety] = useState('My Home Abhra');

  const societies = [
    'My Home Abhra',
    'Lansum Etania',
    'My Home Bhooja',
    'Rajapushpa Atria',
    'My Home Mangala',
    'MyScape Courtyard'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth logic
    onAuthSuccess({
      name: mode === 'signup' ? name : 'Alex Reader',
      society: mode === 'signup' ? society : 'My Home Abhra',
    });
  };

  const handleSSO = (provider: string) => {
    // Mock SSO integration
    alert(`Connecting to ${provider} for verification...`);
    onAuthSuccess({
      name: 'Verified Resident',
      society: society,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full relative z-10">
        <button 
          onClick={onBack}
          className="mb-8 text-slate-400 hover:text-white flex items-center space-x-2 transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-widest">Back to Gateway</span>
        </button>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-900/40">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white">{mode === 'login' ? 'Welcome Back' : 'Join the Society'}</h2>
            <p className="text-slate-400 text-sm mt-2">Verified community access for Hyderabad residents.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Society</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                    value={society}
                    onChange={(e) => setSociety(e.target.value)}
                  >
                    {societies.map(s => <option key={s} value={s} className="bg-slate-800 text-white">{s}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <input 
                required
                type="email" 
                placeholder="name@community.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-900/20 active:scale-[0.98] transition-all mt-4"
            >
              {mode === 'login' ? 'Enter Clubhouse' : 'Create Verified Account'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-tighter">
              <span className="bg-slate-900 px-4 text-slate-500">Fast-Track Verification</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSSO('MyGate')}
              className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all group"
            >
              <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center text-[10px] font-bold text-white">M</div>
              <span className="text-[10px] font-black uppercase text-white tracking-widest">MyGate</span>
            </button>
            <button 
              onClick={() => handleSSO('NoBrokerHood')}
              className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all group"
            >
              <div className="w-5 h-5 bg-red-600 rounded-md flex items-center justify-center text-[10px] font-bold text-white">NB</div>
              <span className="text-[10px] font-black uppercase text-white tracking-widest">NoBroker</span>
            </button>
          </div>

          <p className="text-center mt-8 text-slate-500 text-xs">
            {mode === 'login' ? "New to the community?" : "Already a member?"}
            <button 
              onClick={onToggleMode}
              className="ml-2 text-indigo-400 font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
