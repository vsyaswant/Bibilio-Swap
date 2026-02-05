
import React, { useState, useRef, useEffect } from 'react';
import { identifyBookFromImage, searchBookByTitle } from '../services/geminiService';
import { ReadingStatus } from '../types';

interface BookScannerProps {
  onBookDetected: (bookData: any, coverImage: string, forcedStatus?: ReadingStatus) => void;
  onClose: () => void;
}

const BookScanner: React.FC<BookScannerProps> = ({ onBookDetected, onClose }) => {
  const [tab, setTab] = useState<'scan' | 'search'>('scan');
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (tab === 'scan' && isCameraActive && !preview) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Could not access camera. Please check permissions or use upload.");
          setIsCameraActive(false);
        }
      };
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, preview, tab]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        processImage(base64);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setPreview(base64);
    setScanning(true);
    setIsCameraActive(false);

    try {
      const rawBase64 = base64.split(',')[1];
      const bookData = await identifyBookFromImage(rawBase64);
      onBookDetected(bookData, base64);
    } catch (error) {
      alert("Failed to identify book. Please try again with a clearer picture.");
      setScanning(false);
      setPreview(null);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const bookData = await searchBookByTitle(searchQuery);
      // Automatically add to PAST read if searched (user likely doesn't have it for trade)
      onBookDetected(bookData, bookData.coverUrl, ReadingStatus.PAST);
    } catch (error) {
      alert("Could not find book details. Please try a different title.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header with Tabs */}
        <div className="p-6 border-b border-slate-100 flex flex-col bg-white relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Add to Library</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button 
              onClick={() => { setTab('scan'); setPreview(null); setIsCameraActive(false); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'scan' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Scan Cover
            </button>
            <button 
              onClick={() => { setTab('search'); setPreview(null); setIsCameraActive(false); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'search' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Search History
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {tab === 'scan' ? (
            <div className="p-0">
              {preview ? (
                <div className="flex flex-col items-center p-8">
                  <div className="relative w-48 h-64 rounded-3xl overflow-hidden shadow-2xl mb-6 ring-8 ring-indigo-50">
                    <img src={preview} alt="Book cover preview" className="w-full h-full object-cover" />
                    {scanning && (
                      <div className="absolute inset-0 bg-indigo-900/60 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                        <span className="text-white font-black text-[10px] tracking-[0.3em] animate-pulse uppercase">Syncing with RAG</span>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm font-bold animate-pulse uppercase tracking-widest text-[10px]">Processing Image...</p>
                </div>
              ) : isCameraActive ? (
                <div className="relative bg-black aspect-[3/4] sm:rounded-none overflow-hidden">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none flex items-center justify-center">
                     <div className="w-4/5 h-4/5 border-2 border-dashed border-white/40 rounded-[2rem]"></div>
                  </div>
                  
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center space-x-12 px-6">
                    <button 
                      onClick={() => setIsCameraActive(false)}
                      className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl text-white hover:bg-white/20 transition-colors border border-white/20"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleCapture}
                      className="w-24 h-24 bg-white rounded-full border-[6px] border-indigo-200 flex items-center justify-center shadow-2xl active:scale-90 transition-transform p-1"
                    >
                      <div className="w-full h-full bg-white border-2 border-slate-300 rounded-full"></div>
                    </button>
                    <div className="w-14"></div> 
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  <div 
                    onClick={() => setIsCameraActive(true)}
                    className="bg-indigo-600 rounded-[2.5rem] p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-white text-xl font-black uppercase tracking-tight">Open Camera</h3>
                    <p className="text-indigo-100 text-xs text-center mt-2 font-bold uppercase tracking-widest opacity-80">Instant Physical Verification</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      <span className="bg-white px-4">OR</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <svg className="w-6 h-6 text-slate-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Gallery Upload</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Existing Photo ID</p>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Search Tab Content */
            <div className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900 leading-tight">Add Your Reading History</h3>
                <p className="text-sm text-slate-500">Log books you've read in the past but don't physically own right now to build your taste profile.</p>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. Sapiens, Atomic Habits..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
                >
                  {isSearching ? 'Finding Details...' : 'Search & Log Book'}
                </button>
              </form>

              <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                 <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl flex-shrink-0">💡</div>
                    <div>
                      <h4 className="font-bold text-sm text-indigo-900 mb-1">Why log past reads?</h4>
                      <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">Adding books you've read helps our <strong>Neighbor-First RAG</strong> engine suggest more accurate matches from what your neighbors actually own.</p>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookScanner;
