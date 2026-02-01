
import React, { useState, useRef, useEffect } from 'react';
import { identifyBookFromImage } from '../services/geminiService';

interface BookScannerProps {
  onBookDetected: (bookData: any, coverImage: string) => void;
  onClose: () => void;
}

const BookScanner: React.FC<BookScannerProps> = ({ onBookDetected, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isCameraActive && !preview) {
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
  }, [isCameraActive, preview]);

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

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
          <h2 className="text-xl font-bold text-slate-900">Add to Library</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-0 sm:p-8">
          {preview ? (
            <div className="flex flex-col items-center p-8">
              <div className="relative w-48 h-64 rounded-lg overflow-hidden shadow-xl mb-6 ring-4 ring-indigo-50">
                <img src={preview} alt="Book cover preview" className="w-full h-full object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-indigo-900/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <span className="text-white font-bold text-xs tracking-[0.2em] animate-pulse">ANALYZING</span>
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-sm font-medium animate-pulse">Reading cover details with AI...</p>
            </div>
          ) : isCameraActive ? (
            <div className="relative bg-black aspect-[3/4] sm:rounded-xl overflow-hidden group">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none flex items-center justify-center">
                 <div className="w-3/4 h-3/4 border-2 border-dashed border-white/60 rounded-lg"></div>
              </div>
              
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-8 px-6">
                <button 
                  onClick={() => setIsCameraActive(false)}
                  className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button 
                  onClick={handleCapture}
                  className="w-20 h-20 bg-white rounded-full border-4 border-indigo-200 flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 bg-white border-2 border-slate-300 rounded-full"></div>
                </button>
                <div className="w-12"></div> {/* Spacer to center the button */}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="p-8 space-y-6">
              <div 
                onClick={() => setIsCameraActive(true)}
                className="bg-indigo-600 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold">Open Camera</h3>
                <p className="text-indigo-100 text-sm text-center mt-2">Instantly snap a photo to auto-fill details</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-400 font-medium">OR</span>
                </div>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-slate-900 font-semibold text-sm">Upload from Gallery</p>
                    <p className="text-xs text-slate-500">Pick an existing photo of a book</p>
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
      </div>
    </div>
  );
};

export default BookScanner;
