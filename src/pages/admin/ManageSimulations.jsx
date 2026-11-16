import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  MonitorPlay, Sliders, Plus, Trash2, Save, 
  BookOpen, ChevronLeft, Cpu, Settings, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ManageSimulations = () => {
  const navigate = useNavigate();
  
  // --- Data States (Initialized as Arrays to prevent .map crashes) ---
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  // --- Selection States ---
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // --- Configuration States ---
  const [title, setTitle] = useState('');
  const [renderer, setRenderer] = useState('threejs');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Dynamic Builders ---
  const [params, setParams] = useState([
    { name: 'speed', label: 'Animation Speed', min: 0.1, max: 2, default: 1, ui: 'slider' }
  ]);
  const [notes, setNotes] = useState([
    { title: 'Theory', content: '', note_type: 'theory' }
  ]);

  // 1. Fetch Subjects on Mount
  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      let actualData = [];
      // Flexible Parsing Logic
      if (Array.isArray(res.data)) actualData = res.data;
      else if (res.data?.data && Array.isArray(res.data.data)) actualData = res.data.data;
      else if (res.data?.data?.subjects && Array.isArray(res.data.data.subjects)) actualData = res.data.data.subjects;
      
      setSubjects(actualData);
    } catch (err) {
      console.error("Subject fetch failed");
    }
  };

  // 2. Fetch Topics when Subject changes
  const handleSubjectChange = async (slug) => {
    setSelectedSub(slug);
    setSelectedTopic('');
    setChapters([]);
    if (!slug) return;
    try {
      const res = await api.get(`/subjects/${slug}/topics`);
      const data = res.data?.data || res.data || [];
      setTopics(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Topic fetch failed"); }
  };

  // 3. Fetch Chapters when Topic changes
  const handleTopicChange = async (topicId) => {
    setSelectedTopic(topicId);
    setSelectedChapter('');
    if (!topicId) return;
    try {
      const res = await api.get(`/topics/${topicId}/lessons`);
      const data = res.data?.data || res.data || [];
      setChapters(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Chapters fetch failed"); }
  };

  // --- UI Logic ---
  const addParam = () => setParams([...params, { name: '', label: '', min: 0, max: 10, default: 5, ui: 'slider' }]);
  const updateParam = (i, field, val) => {
    const p = [...params];
    p[i][field] = val;
    setParams(p);
  };

  const handleSave = async () => {
    if (!selectedChapter || !title) return alert("Select Chapter and Title");
    setIsLoading(true);
    try {
      const simPayload = {
        chapter_id: selectedChapter,
        title,
        description,
        sim_type: title.toLowerCase().replace(/\s+/g, '_'),
        renderer,
        config: { parameters: params }
      };

      const res = await api.post('/simulations', simPayload);
      const simId = res.data.data.id;

      // Sync Notes
      for (let i = 0; i < notes.length; i++) {
        if (notes[i].content.trim()) {
          await api.post(`/simulations/${simId}/notes`, { ...notes[i], order_index: i });
        }
      }

      alert("Simulation Configured Successfully!");
      navigate('/admin');
    } catch (err) {
      alert("Error saving configuration.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-card p-6 rounded-[2rem] border border-app shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-primary-glow rounded-full text-slate-400 hover:text-primary transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Simulation Configurator</h1>
        </div>
        <button onClick={handleSave} disabled={isLoading || !selectedChapter} className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-30">
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </header>

      {/* 1. SELECTION HIERARCHY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-[2rem] border border-app shadow-xl">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">1. Subject</label>
          <select value={selectedSub} onChange={(e) => handleSubjectChange(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl font-bold dark:text-white outline-none focus:ring-1 focus:ring-primary">
            <option value="">Select Domain...</option>
            {Array.isArray(subjects) && subjects.map(s => <option key={s.id} value={s.slug || s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="bg-card p-6 rounded-[2rem] border border-app shadow-xl">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">2. Topic</label>
          <select value={selectedTopic} onChange={(e) => handleTopicChange(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl font-bold dark:text-white outline-none focus:ring-1 focus:ring-primary">
            <option value="">Select Topic...</option>
            {Array.isArray(topics) && topics.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
          </select>
        </div>
        <div className="bg-card p-6 rounded-[2rem] border border-app shadow-xl">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">3. Link to Chapter</label>
          <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl font-bold dark:text-white outline-none focus:ring-1 focus:ring-primary">
            <option value="">Select Chapter...</option>
            {Array.isArray(chapters) && chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ENGINE CONFIG */}
        <div className="bg-card p-8 rounded-[3rem] border border-app shadow-xl space-y-6">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><Cpu className="text-primary"/> Engine Settings</h2>
          <div className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl dark:text-white font-bold" placeholder="Simulation Title" />
            <select value={renderer} onChange={e => setRenderer(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl dark:text-white font-bold">
              <option value="threejs">Three.js (3D)</option>
              <option value="p5js">p5.js (2D)</option>
            </select>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl dark:text-white min-h-[100px]" placeholder="Learning Objectives..." />
          </div>
        </div>

        {/* PARAMETERS (SLIDERS) */}
        <div className="bg-card p-8 rounded-[3rem] border border-app shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><Sliders className="text-primary"/> UI Sliders</h2>
            <button onClick={addParam} className="p-2 bg-primary text-white rounded-xl shadow-lg"><Plus size={20}/></button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {params.map((p, i) => (
              <div key={i} className="p-5 bg-slate-50 dark:bg-zinc-900/50 border border-app rounded-2xl space-y-4 relative group">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Variable Name" className="p-3 bg-card border border-app rounded-xl text-xs dark:text-white" value={p.name} onChange={e => updateParam(i, 'name', e.target.value)} />
                  <input placeholder="UI Label" className="p-3 bg-card border border-app rounded-xl text-xs dark:text-white font-bold" value={p.label} onChange={e => updateParam(i, 'label', e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Min" className="p-2 bg-card border border-app rounded-lg text-xs dark:text-white" value={p.min} onChange={e => updateParam(i, 'min', parseFloat(e.target.value))} />
                  <input type="number" placeholder="Max" className="p-2 bg-card border border-app rounded-lg text-xs dark:text-white" value={p.max} onChange={e => updateParam(i, 'max', parseFloat(e.target.value))} />
                  <input type="number" placeholder="Default" className="p-2 bg-card border border-app rounded-lg text-xs dark:text-white font-bold text-primary" value={p.default} onChange={e => updateParam(i, 'default', parseFloat(e.target.value))} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSimulations;