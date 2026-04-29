/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useNavigate,
  useLocation
} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  BookMarked, 
  Wind, 
  Layers, 
  Database,
  Maximize2,
  Compass,
  Map as MapIcon,
  Globe,
  Settings,
  Info,
  X,
  Navigation
} from 'lucide-react';
import { CHINA_GEOGRAPHY_CHAPTERS, Chapter, GeoPoint } from './data/chinaGeography';
import ReactMarkdown from 'react-markdown';
import AdminPanel from './components/AdminPanel';

// --- Immersive Map Component (Google Earth Style) ---
const InteractiveGlobe = ({ 
  selectedPoint 
}: { 
  selectedPoint: GeoPoint | null
}) => {
  const focus = selectedPoint?.mapFocus || { x: 400, y: 300, zoom: 0.8 };
  
  const viewBoxX = focus.x - (400 / focus.zoom);
  const viewBoxY = focus.y - (300 / focus.zoom);
  const viewBoxW = 800 / focus.zoom;
  const viewBoxH = 600 / focus.zoom;

  return (
    <div className="relative w-full h-full bg-[#050608] overflow-hidden group">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a202c_0%,#050608_100%)] opacity-40" />
      
      {/* Interactive Map SVG */}
      <motion.svg 
        animate={{ viewBox: `${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}` }}
        transition={{ type: 'spring', damping: 30, stiffness: 80 }}
        className="w-full h-full p-0 relative z-10"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="china-grad" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#1e293b" />
             <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Outer Space / Grid */}
        <g stroke="#ffffff" strokeOpacity="0.03" strokeWidth="0.5">
          {Array.from({ length: 40 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="1200" />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 20} x2="1600" y2={i * 20} />
          ))}
        </g>

        {/* Abstract China Landmass */}
        <motion.path
          d="M200,450 L350,380 L450,280 L600,320 L750,450 L680,600 L500,680 L250,650 Z"
          fill="url(#china-grad)"
          stroke="#4b5563"
          strokeWidth="0.5"
          className="opacity-50"
        />

        {/* Dynamic Focus Point */}
        {selectedPoint && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={selectedPoint.id}
          >
            <circle 
              cx={selectedPoint.mapFocus?.x || 400} 
              cy={selectedPoint.mapFocus?.y || 350} 
              r="6" 
              fill="#3b82f6" 
              filter="url(#glow)"
            >
               <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle 
              cx={selectedPoint.mapFocus?.x || 400} 
              cy={selectedPoint.mapFocus?.y || 350} 
              r="24" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="0.5" 
              strokeOpacity="0.2"
            />
          </motion.g>
        )}
      </motion.svg>

      {/* Floating Status UI */}
      <div className="absolute top-10 left-10 z-20 space-y-4">
        <div className="flex items-center gap-4 px-5 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
           <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Spatial OS // Render Active</span>
        </div>
      </div>

      {/* Nav Tools */}
      <div className="absolute bottom-10 right-10 flex flex-col gap-3 z-20">
         <button className="w-12 h-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all shadow-2xl">
            <Maximize2 className="w-5 h-5" />
         </button>
         <button className="w-12 h-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all shadow-2xl">
            <Compass className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};

// --- Viewer Page Implementation ---
const ViewerPage = () => {
  const [chapters, setChapters] = useState<Chapter[]>(CHINA_GEOGRAPHY_CHAPTERS);
  const [activeChapter, setActiveChapter] = useState<Chapter>(chapters[0]);
  const [selectedPoint, setSelectedPoint] = useState<GeoPoint | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('geo_chapters');
    if (saved) {
      const parsed = JSON.parse(saved);
      setChapters(parsed);
      setActiveChapter(parsed[0]);
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-[#050608] flex overflow-hidden font-sans selection:bg-blue-500/30 text-white">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <InteractiveGlobe selectedPoint={selectedPoint} />
      </div>

      {/* Navigation Overlay (Left) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            className="relative z-50 w-96 h-full p-8 flex flex-col pointer-events-none"
          >
            <div className="flex-1 bg-[#0a0c10]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] p-10 flex flex-col pointer-events-auto border-t-white/10">
              <div className="mb-12">
                <h1 className="text-2xl font-black tracking-tighter mb-1">GEO<span className="text-blue-500 uppercase">Studio</span></h1>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Advanced Cartographic Interface</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar-dark pr-4 space-y-2">
                <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em] mb-4 px-2">Project Layers</h2>
                {chapters.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => { setActiveChapter(ch); setSelectedPoint(null); }}
                    className={`w-full group p-5 rounded-2xl text-left transition-all border ${
                      activeChapter.id === ch.id 
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                      : 'border-transparent text-white/40 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                       <span className={`text-sm font-black tracking-tight ${activeChapter.id === ch.id ? 'text-white' : ''}`}>{ch.title}</span>
                       <ChevronRight className={`w-4 h-4 transition-transform ${activeChapter.id === ch.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-white/5">
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em] mb-6 px-2">Active Data Points</h3>
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar-dark pr-2">
                   {activeChapter.points.map(p => (
                     <button
                        key={p.id}
                        onClick={() => setSelectedPoint(p)}
                        className={`p-4 rounded-xl text-left transition-all border ${
                          selectedPoint?.id === p.id 
                          ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 border-white/5 text-white/60 hover:border-white/10'
                        }`}
                     >
                       <div className="text-[10px] opacity-40 font-black mb-1 flex items-center gap-2">
                         <div className={`w-1 h-1 rounded-full ${selectedPoint?.id === p.id ? 'bg-black' : 'bg-blue-500'}`} />
                         {p.type.toUpperCase()}
                       </div>
                       <div className="text-xs font-bold truncate">{p.title}</div>
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Info Display (Right) */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            className="relative z-40 w-[480px] h-full p-8 flex flex-col pointer-events-none"
          >
            <div className="flex-1 bg-white rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-12 flex flex-col pointer-events-auto text-slate-900 border border-t-white overflow-hidden relative">
              <button 
                onClick={() => setSelectedPoint(null)}
                className="absolute top-10 right-10 p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                 <X className="w-5 h-5 text-slate-800" />
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                <div className="flex items-center gap-3 mb-8">
                  <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg tracking-widest">Metadata</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedPoint.type}</span>
                </div>

                <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-10 leading-[1.1]">{selectedPoint.title}</h2>
                
                {selectedPoint.visualUrl && (
                  <div className="w-full aspect-[16/10] bg-slate-100 rounded-3xl overflow-hidden mb-12 shadow-2xl border border-slate-100">
                    <img src={selectedPoint.visualUrl} alt={selectedPoint.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="prose prose-slate prose-sm max-w-none mb-12">
                   <div className="text-slate-600 font-medium leading-relaxed tracking-tight text-base">
                      <ReactMarkdown>{selectedPoint.content}</ReactMarkdown>
                   </div>
                </div>

                {selectedPoint.animationSteps && (
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Geologic Sequencer</h4>
                    <div className="space-y-4">
                       {selectedPoint.animationSteps.map((step, idx) => (
                         <div key={idx} className="flex gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                           <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</div>
                           <p className="text-xs font-bold text-slate-800 leading-normal">{step}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100 flex gap-4">
                 <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Download Assets</button>
                 <button className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                    <Globe className="w-6 h-6" />
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-between px-10 pointer-events-none z-50">
          <div className="flex items-center gap-8 px-8 h-10 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full pointer-events-auto">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Engine: V5.0</span>
             </div>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex gap-6">
                <div className="flex flex-col justify-center">
                   <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Lat / Long</span>
                   <span className="text-[10px] font-black tabular-nums">{selectedPoint?.mapFocus?.x.toFixed(2) || '0.00'} // {selectedPoint?.mapFocus?.y.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex flex-col justify-center">
                   <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Zoom</span>
                   <span className="text-[10px] font-black tabular-nums">{selectedPoint?.mapFocus?.zoom.toFixed(2) || '1.00'}x</span>
                </div>
             </div>
          </div>

          <div className="pointer-events-auto">
             <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="px-6 h-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full text-[9px] font-black text-white/40 hover:text-white uppercase tracking-[0.4em] transition-all"
             >
                Toggle Controls
             </button>
          </div>
      </footer>
    </div>
  );
};

// --- Admin Page Wrapper ---
const AdminPage = () => {
  const [chapters, setChapters] = useState<Chapter[]>(CHINA_GEOGRAPHY_CHAPTERS);

  useEffect(() => {
    const saved = localStorage.getItem('geo_chapters');
    if (saved) setChapters(JSON.parse(saved));
  }, []);

  const handleSave = (newChapters: Chapter[]) => {
    localStorage.setItem('geo_chapters', JSON.stringify(newChapters));
    setChapters(newChapters);
  };

  return (
    <div className="h-screen bg-white">
      <AdminPanel chapters={chapters} onSaveChapters={handleSave} />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ViewerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
