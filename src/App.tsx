/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  BookOpen, 
  MessageCircle, 
  ChevronRight, 
  Search,
  BookMarked,
  Info,
  Layers,
  Wind,
  Droplets
} from 'lucide-react';
import { CHINA_GEOGRAPHY_CHAPTERS, Chapter } from './data/chinaGeography';
import { askGeographyTutor } from './services/geminiService';
import ReactMarkdown from 'react-markdown';

// Simplified SVG Map Component (Just a few provinces for demo, Hubei highlighted)
const ChinaMap = ({ onProvinceClick, selectedId }: { onProvinceClick: (id: string) => void, selectedId?: string }) => {
  return (
    <div id="china-map-container" className="relative w-full aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
      <svg viewBox="0 0 800 600" className="w-full h-full p-8">
        {/* Placeholder for real SVG paths - focusing on rough shapes for demonstration */}
        <g id="provinces">
          {/* Hubei */}
          <path
            id="HB"
            d="M480 340 L520 330 L530 350 L510 370 L470 360 Z"
            fill={selectedId === 'HB' ? '#3b82f6' : '#93c5fd'}
            stroke="#1e3a8a"
            strokeWidth="1"
            className="cursor-pointer transition-colors"
            onClick={() => onProvinceClick('HB')}
          />
          <text x="485" y="355" className="text-[10px] pointer-events-none fill-slate-800 font-bold">湖北</text>
          
          {/* Surroundings */}
          <path d="M400 300 L470 330 L460 380 L380 370 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
          <path d="M530 310 L580 320 L570 360 L520 350 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
          <path d="M480 370 L530 380 L525 420 L470 410 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
        </g>
        
        {/* Geographic Lines */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="#cbd5e1" strokeDasharray="4" /> {/* Parallel 40N */}
        <line x1="0" y1="400" x2="800" y2="400" stroke="#cbd5e1" strokeDasharray="4" /> {/* Parallel 23.5N */}
      </svg>
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md p-2 rounded-lg text-xs font-medium text-slate-500 border border-slate-200">
        交互地图：点击省份查看详情
      </div>
    </div>
  );
};

const AIAssistantSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    
    const response = await askGeographyTutor(userMsg);
    setChat(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="ai-tutor-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col"
        >
          <div className="p-4 border-bottom flex justify-between items-center bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold">地理AI老师</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">退出</button>
          </div>
          
          <div id="chat-messages" className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.length === 0 && (
              <div className="text-center py-10 opacity-50 space-y-2">
                <p>你好！我是你的地理助教。</p>
                <p className="text-xs">你可以问我关于“三级阶梯”、“武汉降水成因”等问题。</p>
              </div>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 animate-pulse">正在解析地理规律...</div>}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="relative">
              <input
                type="text"
                placeholder="询问地理知识..."
                className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [activeChapter, setActiveChapter] = useState<Chapter>(CHINA_GEOGRAPHY_CHAPTERS[0]);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();
  const [selectedPoint, setSelectedPoint] = useState<GeoPoint | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-hidden">
      {/* Header Section */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Layers className="w-5 h-5 pointer-events-none" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">GeoRecall | <span className="text-blue-600">地理互动复习</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">湖北省高考考纲同步版 (武汉专用)</p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
            <button className="px-5 py-1.5 bg-white shadow-sm rounded-full text-xs font-bold text-blue-600 transition-all">中国区域</button>
            <button className="px-5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">世界区域</button>
            <button className="px-5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">地球科学</button>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
             <div className="h-8 w-8 bg-slate-200 rounded-full border border-slate-300 ring-2 ring-white"></div>
          </div>
        </nav>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation */}
        <aside className="w-64 flex flex-col p-6 gap-6 bg-slate-50/50 border-r border-slate-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase mb-4 px-1 tracking-widest">核心复习章节</h2>
            <nav className="space-y-1">
              {CHINA_GEOGRAPHY_CHAPTERS.map(chapter => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${
                    activeChapter.id === chapter.id 
                    ? 'bg-blue-50 border border-blue-100 text-blue-700 font-bold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <span className="truncate">{chapter.title.split('与')[0]}</span>
                  {activeChapter.id === chapter.id && (
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl shadow-slate-200/50 mt-auto relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <BookMarked className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-bold opacity-60 mb-1 tracking-widest">复习进度</p>
              <div className="text-3xl font-black mb-4 font-display">42<span className="text-blue-400 text-xl">%</span></div>
              <div className="w-full bg-white/10 h-2 rounded-full mb-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full w-[42%] shadow-[0_0_12px_rgba(59,130,246,0.4)]"></div>
              </div>
              <p className="text-[10px] opacity-40 font-medium">距离湖北省学业水平考试还有 <span className="text-white">45</span> 天</p>
            </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
          <section className="flex-1 flex flex-col gap-6">
            <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm relative overflow-hidden flex items-center justify-center p-8">
              {/* Map Floating Control Overlay */}
              <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-slate-200 px-4 py-2 rounded-2xl shadow-lg shadow-slate-200/50 text-xs font-bold text-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  中国地理：行政区划与自然地势层
                </div>
              </div>

              <div className="w-full h-full relative group">
                <ChinaMap 
                  selectedId={selectedProvince}
                  onProvinceClick={(id) => setSelectedProvince(id)}
                />
                
                {/* Floating Map Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 active:scale-95 transition-all focus:ring-4 focus:ring-blue-100">+</button>
                  <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 active:scale-95 transition-all focus:ring-4 focus:ring-blue-100">-</button>
                  <button onClick={() => setSelectedProvince(undefined)} className="w-10 h-10 bg-blue-600 border border-blue-700 rounded-xl shadow-lg flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition-all shadow-blue-200">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-32 shrink-0 bg-white border border-slate-200 rounded-3xl flex items-center p-6 gap-8 shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest px-1">正在考察：{selectedProvince === 'HB' ? '江汉平原 (湖北)' : '概览视图'}</h3>
                <div className="flex gap-2">
                  <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-bold px-3 py-1 rounded-lg">农业区位分析</span>
                  <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-3 py-1 rounded-lg">水系与防灾机制</span>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-3 py-1 rounded-lg">中游城市群协同</span>
                </div>
                <p className="text-sm text-slate-500 mt-3 line-clamp-1 font-medium">
                  {selectedProvince === 'HB' 
                    ? '江汉平原位于湖北中南部，是我国重要商品粮基地，需重点掌握其自然灾害防治与产业转型。' 
                    : '点击地图上的省份或特定地理单元，查看深度复习资料与历年高考真题分析。'
                  }
                </p>
              </div>
              <button 
                onClick={() => setIsAIOpen(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                知识深度检测
              </button>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="w-80 flex flex-col gap-6">
            <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
              <h2 className="text-[10px] font-black text-slate-400 uppercase mb-5 tracking-widest px-1">考纲核心知识点</h2>
              <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
                {activeChapter.points.map((point) => (
                  <div 
                    key={point.id} 
                    onClick={() => setSelectedPoint(point)}
                    className="group cursor-pointer hover:translate-x-1 transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-200 bg-white group-hover:border-blue-500 transition-colors flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all"></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{point.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold italic">考频：高核心考点</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-100 mt-4">
                <button className="w-full py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-slate-800 transition-all">
                  下载章节复习课件 (PDF)
                </button>
              </div>
            </div>

            <div className="h-56 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-6 shadow-sm overflow-hidden relative group">
              <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform">
                <Info className="w-32 h-32 text-blue-600" />
              </div>
              <h2 className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest">典型例题解析</h2>
              <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-sm relative z-10 hover:shadow-md transition-shadow">
                {activeChapter.questions && activeChapter.questions.length > 0 ? (
                  <>
                    <p className="text-xs text-slate-700 leading-relaxed font-bold">
                      “{activeChapter.questions[0].question}”
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => setIsAIOpen(true)}
                        className="text-[10px] font-black text-blue-600 flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        查看详细解析与答案 <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">本章节暂无典型例题，请咨询AI助手。</p>
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"></span>
            地图数据渲染已就绪
          </span>
          <span className="opacity-30">|</span>
          <span className="tracking-tight">当前复习范围：中国 / 湖北省 / 武汉市</span>
          <span className="opacity-30">|</span>
          <span className="opacity-70">Build 2026.04.26 (Final)</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-wider">Feedback</button>
          <button className="text-[10px] font-black text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all uppercase tracking-wider shadow-lg shadow-slate-200">Expansion Plugins</button>
        </div>
      </footer>

      {/* AI Assistant Overlay/Panel */}
      <AIAssistantSidebar isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      {/* Global Animation Player Modal */}
      <AnimatePresence>
        {selectedPoint && (
          <KnowledgeDetailModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

const KnowledgeDetailModal = ({ point, onClose }: { point: GeoPoint, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        layoutId={`point-${point.id}`}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[85vh] border border-white/20"
      >
        {/* Visual Content Player */}
        <div className="flex-1 bg-slate-900 relative group overflow-hidden">
          {point.visualUrl ? (
            <motion.img 
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              src={point.visualUrl} 
              alt={point.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-800 italic">
              <Layers className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm tracking-widest opacity-40 uppercase font-black">Stereoscopic Rendering...</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <div className="absolute bottom-10 left-10 right-10">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {point.animationSteps?.map((step, idx) => (
                <div 
                  key={idx}
                  className="bg-blue-600/20 backdrop-blur-xl border border-blue-400/30 text-blue-200 text-[10px] px-4 py-1.5 rounded-full font-black flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
                  STEP {idx + 1}: {step}
                </div>
              ))}
              {!point.animationSteps && <div className="bg-white/10 text-white/40 text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/10">Standard View Mode</div>}
            </motion.div>
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-black text-white font-display mb-4 tracking-tighter"
            >
              {point.title}
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/50 text-base leading-relaxed max-w-xl font-medium"
            >
              正在播放该知识点的立体演示。通过 3D 地形层叠与大气对流模拟，解析核心地理成因。
            </motion.p>
          </div>

          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center text-white transition-all border border-white/10 group active:scale-90"
          >
            <ChevronRight className="w-6 h-6 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Knowledge Info Panel */}
        <div className="w-full lg:w-96 bg-white p-10 overflow-y-auto custom-scrollbar flex flex-col shrink-0">
          <div className="mb-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">考点深度详解 / ANALYSIS</h4>
            <div className="space-y-6">
               {point.content.split('。').map((s, i) => s ? (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.6 + i * 0.1 }}
                   className="pl-4 border-l-4 border-blue-500 py-1"
                 >
                   <p className="text-sm text-slate-900 font-bold leading-relaxed">{s}。</p>
                 </motion.div>
               ) : null)}
            </div>
          </div>

          <div className="mt-auto bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Info className="w-12 h-12" />
            </div>
            <h5 className="text-[10px] font-black text-blue-600 mb-3 tracking-widest uppercase">提分笔记</h5>
            <p className="text-xs text-slate-600 italic leading-loose font-medium">
              💡 考纲要求掌握该现象的空间分布规律及成因分析（综合思维）。建议结合右侧演示中的地形阻挡因素进行记忆。
            </p>
            <button 
              onClick={() => { onClose(); }}
              className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              模拟高考真题演练 (BETA)
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
