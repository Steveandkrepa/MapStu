/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Edit3, 
  ChevronRight, 
  Layers, 
  Settings, 
  X,
  Type,
  FileText,
  MapPin
} from 'lucide-react';
import { Chapter, GeoPoint } from '../data/chinaGeography';

export default function AdminPanel({ 
  chapters, 
  onSaveChapters 
}: { 
  chapters: Chapter[], 
  onSaveChapters: (newChapters: Chapter[]) => void 
}) {
  const [localChapters, setLocalChapters] = useState<Chapter[]>(JSON.parse(JSON.stringify(chapters)));
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingPoint, setEditingPoint] = useState<{ chapterId: string, point: GeoPoint } | null>(null);

  const saveAll = () => {
    onSaveChapters(localChapters);
    alert('所有更改已同步到应用中。');
  };

  const addChapter = () => {
    const newId = `new-ch-${Date.now()}`;
    const newCh: Chapter = {
      id: newId,
      title: '新章节标题',
      points: []
    };
    setLocalChapters([...localChapters, newCh]);
    setEditingChapterId(newId);
  };

  const updateChapterTitle = (id: string, title: string) => {
    setLocalChapters(prev => prev.map(ch => ch.id === id ? { ...ch, title } : ch));
  };

  const deleteChapter = (id: string) => {
    if (confirm('确定删除整个章节吗？')) {
      setLocalChapters(prev => prev.filter(ch => ch.id !== id));
    }
  };

  const addPoint = (chId: string) => {
    const newPoint: GeoPoint = {
      id: `p-${Date.now()}`,
      title: '新知识点',
      content: '详细描述...',
      type: 'concept',
      mapFocus: { x: 400, y: 300, zoom: 1 }
    };
    setLocalChapters(prev => prev.map(ch => ch.id === chId ? { ...ch, points: [...ch.points, newPoint] } : ch));
    setEditingPoint({ chapterId: chId, point: newPoint });
  };

  const updatePoint = (chId: string, updatedPoint: GeoPoint) => {
    setLocalChapters(prev => prev.map(ch => ch.id === chId ? {
      ...ch,
      points: ch.points.map(p => p.id === updatedPoint.id ? updatedPoint : p)
    } : ch));
  };

  const deletePoint = (chId: string, pId: string) => {
    setLocalChapters(prev => prev.map(ch => ch.id === chId ? {
      ...ch,
      points: ch.points.filter(p => p.id !== pId)
    } : ch));
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fbfbfb]">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter">章节可视化编辑器</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Content Management System</p>
          </div>
        </div>
        <button 
          onClick={saveAll}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> 同步数据
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-8">
        <div className="grid grid-cols-12 gap-10">
          {/* Chapter List Area */}
          <div className="col-span-4 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">章节导航</h3>
              <button onClick={addChapter} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"><Plus className="w-4 h-4" /></button>
            </div>
            {localChapters.map(ch => (
              <motion.div 
                key={ch.id}
                onClick={() => setEditingChapterId(ch.id)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${
                  editingChapterId === ch.id 
                  ? 'bg-white border-blue-600 shadow-2xl shadow-blue-50 ring-4 ring-blue-50' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-xs font-black text-slate-400">{ch.points.length}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteChapter(ch.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input 
                  type="text"
                  value={ch.title}
                  onChange={(e) => updateChapterTitle(ch.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent font-black text-lg tracking-tighter outline-none focus:text-blue-600"
                />
              </motion.div>
            ))}
          </div>

          {/* Points Editor Context */}
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              {editingChapterId ? (
                <motion.div
                  key={editingChapterId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm min-h-[600px]"
                >
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <Layers className="w-6 h-6 text-blue-600" />
                      <h3 className="text-2xl font-black tracking-tighter">编辑知识点: {localChapters.find(c => c.id === editingChapterId)?.title}</h3>
                    </div>
                    <button 
                      onClick={() => addPoint(editingChapterId)}
                      className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800"
                    >
                      <Plus className="w-4 h-4" /> 添加新点
                    </button>
                  </div>

                  <div className="space-y-4">
                    {localChapters.find(c => c.id === editingChapterId)?.points.map(p => (
                      <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors group">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{p.type}</span>
                              <h4 className="font-bold text-slate-900">{p.title}</h4>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{p.content}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingPoint({ chapterId: editingChapterId!, point: p })}
                              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 shadow-sm"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deletePoint(editingChapterId!, p.id)}
                              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center">
                   <Layers className="w-20 h-20 text-slate-200 mb-6" />
                   <p className="text-xl font-black text-slate-300 uppercase tracking-widest">请选择一个章节开始编辑</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Point Detail Editor Modal */}
      <AnimatePresence>
        {editingPoint && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 flex flex-col gap-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                <h3 className="text-2xl font-black tracking-tighter">知识点属性编辑</h3>
                <button onClick={() => setEditingPoint(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3"><Type className="w-3 h-3" /> 标题</label>
                    <input 
                      type="text" 
                      value={editingPoint.point.title}
                      onChange={(e) => setEditingPoint({ ...editingPoint, point: { ...editingPoint.point, title: e.target.value } })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3"><FileText className="w-3 h-3" /> 详情内容</label>
                    <textarea 
                      rows={4}
                      value={editingPoint.point.content}
                      onChange={(e) => setEditingPoint({ ...editingPoint, point: { ...editingPoint.point, content: e.target.value } })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 text-sm font-medium leading-relaxed"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3"><MapPin className="w-3 h-3" /> 地图焦点配置 (X, Y, Zoom)</label>
                    <div className="flex gap-4">
                      <input 
                        type="number" 
                        placeholder="X"
                        value={editingPoint.point.mapFocus?.x}
                        onChange={(e) => setEditingPoint({ ...editingPoint, point: { ...editingPoint.point, mapFocus: { ...editingPoint.point.mapFocus!, x: Number(e.target.value) } } })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                      />
                      <input 
                        type="number" 
                        placeholder="Y"
                        value={editingPoint.point.mapFocus?.y}
                        onChange={(e) => setEditingPoint({ ...editingPoint, point: { ...editingPoint.point, mapFocus: { ...editingPoint.point.mapFocus!, y: Number(e.target.value) } } })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                      />
                       <input 
                        type="number" 
                        placeholder="Zoom"
                        value={editingPoint.point.mapFocus?.zoom}
                        onChange={(e) => setEditingPoint({ ...editingPoint, point: { ...editingPoint.point, mapFocus: { ...editingPoint.point.mapFocus!, zoom: Number(e.target.value) } } })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">视觉资源 (Image URL)</label>
                    <input 
                      type="text" 
                      value={editingPoint.point.visualUrl || ''}
                      onChange={(e) => setEditingPoint({ ...editingPoint, point: { ...editingPoint.point, visualUrl: e.target.value } })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingPoint(null)}
                  className="px-8 py-4 bg-slate-100 text-slate-800 rounded-2xl font-black text-sm"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    updatePoint(editingPoint.chapterId, editingPoint.point);
                    setEditingPoint(null);
                  }}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100"
                >
                  保存该知识点
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
