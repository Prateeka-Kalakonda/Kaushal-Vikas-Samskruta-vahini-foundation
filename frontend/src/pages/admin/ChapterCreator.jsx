import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, Edit3, ChevronLeft, Save, 
  BookOpen, Layers, X, Layout, FileText, AlertCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ChapterCreator = () => {
  const navigate = useNavigate();

  // --- DATA STATES ---
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  // --- SELECTION STATES ---
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  
  // --- NEW TOPIC INLINE STATES ---
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // --- UI STATES ---
  const [loading, setLoading] = useState(false);
  const [showForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // --- FORM STATES ---
  const [formData, setFormData] = useState({ id: '', title: '', chapter_num: 1, ncert_ref: '', order_index: 1 });

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      const data = res.data?.data || res.data || [];
      setSubjects(Array.isArray(data) ? data : (data.subjects || []));
    } catch (err) { setError("Could not sync subjects."); }
  };

  const handleSubjectChange = async (slug) => {
    setSelectedSub(slug);
    setSelectedTopic('');
    setTopics([]);
    setChapters([]);
    setIsCreatingTopic(false);
    if (!slug) return;
    fetchTopics(slug);
  };

  const fetchTopics = async (slug) => {
    try {
      const res = await api.get(`/subjects/${slug}/topics`);
      const data = res.data?.data || res.data || [];
      setTopics(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Topics fetch error"); }
  };

  // --- NEW: INLINE TOPIC CREATION LOGIC ---
  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    setLoading(true);
    try {
      // Find current subject ID
      const currentSub = subjects.find(s => s.slug === selectedSub || s.id === selectedSub);
      
      const res = await api.post('/admin/topics', {
        title: newTopicName,
        subject_id: currentSub.id,
        order_index: topics.length + 1
      });

      if (res.data.success) {
        setNewTopicName('');
        setIsCreatingTopic(false);
        // Refresh topics and automatically select the new one
        await fetchTopics(selectedSub);
        setSelectedTopic(res.data.data.id);
        fetchChapters(res.data.data.id);
      }
    } catch (err) {
      alert("Failed to create topic.");
    } finally { setLoading(false); }
  };

  const handleTopicChange = async (topicId) => {
    setSelectedTopic(topicId);
    if (!topicId) return;
    fetchChapters(topicId);
  };

  const fetchChapters = async (topicId) => {
    setLoading(true);
    try {
      const res = await api.get(`/topics/${topicId}/lessons`);
      const data = res.data?.data || res.data || [];
      setChapters(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Chapters fetch error"); }
    finally { setLoading(false); }
  };

  // --- FORM LOGIC ---
  const openForm = (chapter = null) => {
    if (chapter) {
      setIsEditing(true);
      setFormData({ id: chapter.id, title: chapter.title, chapter_num: chapter.chapter_num || 1, ncert_ref: chapter.ncert_ref || '', order_index: chapter.order_index || 1 });
    } else {
      setIsEditing(false);
      setFormData({ id: '', title: '', chapter_num: chapters.length + 1, ncert_ref: '', order_index: chapters.length + 1 });
    }
    setShowAddForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { topic_id: selectedTopic, lesson_id: selectedTopic, title: formData.title, chapter_num: parseInt(formData.chapter_num), ncert_ref: formData.ncert_ref, order_index: parseInt(formData.order_index) };
      if (isEditing) { await api.put(`/admin/chapters/${formData.id}`, payload); }
      else { await api.post('/admin/chapters', payload); }
      setShowAddForm(false);
      fetchChapters(selectedTopic);
    } catch (err) { alert("Error saving chapter."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center bg-card p-6 rounded-[2rem] border border-app shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Chapter Manager</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Organize Curriculum</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SUBJECT SELECTION */}
        <div className="bg-card p-6 rounded-[2.5rem] border border-app shadow-xl">
          <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block ml-1 tracking-widest">1. Select Subject</label>
          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select value={selectedSub} onChange={(e) => handleSubjectChange(e.target.value)} className="w-full pl-12 p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl font-bold dark:text-white outline-none focus:ring-1 focus:ring-primary appearance-none">
              <option value="">Select Domain...</option>
              {subjects.map(s => <option key={s.id} value={s.slug || s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* TOPIC SELECTION / INLINE CREATION */}
        <div className="bg-card p-6 rounded-[2.5rem] border border-app shadow-xl">
          <div className="flex justify-between items-center mb-3 px-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">2. Topic</label>
            {selectedSub && (
              <button 
                onClick={() => setIsCreatingTopic(!isCreatingTopic)}
                className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg transition-all ${isCreatingTopic ? 'bg-red-500/10 text-red-500' : 'bg-primary-glow text-primary'}`}
              >
                {isCreatingTopic ? 'Cancel' : '+ Create New Topic'}
              </button>
            )}
          </div>

          <div className="relative">
            {isCreatingTopic ? (
              <div className="flex gap-2">
                <input 
                  autoFocus
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="flex-1 p-4 bg-slate-50 dark:bg-zinc-900 border-2 border-primary rounded-2xl font-bold dark:text-white outline-none"
                  placeholder="Enter Topic Name..."
                />
                <button onClick={handleCreateTopic} className="p-4 bg-primary text-white rounded-2xl shadow-lg hover:brightness-110">
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <>
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select disabled={!selectedSub} value={selectedTopic} onChange={(e) => handleTopicChange(e.target.value)} className="w-full pl-12 p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl font-bold dark:text-white outline-none focus:ring-1 focus:ring-primary appearance-none disabled:opacity-30">
                  <option value="">{topics.length > 0 ? 'Select Topic...' : 'No topics found'}</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* REST OF CHAPTER LIST AND OVERLAY FORM (UNCHANGED LOGIC) */}
      <AnimatePresence>
        {selectedTopic && !isCreatingTopic && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><FileText className="text-primary" size={20} /> Chapters</h2>
              <button onClick={() => openForm()} className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">+ Add New Chapter</button>
            </div>
            <div className="bg-card rounded-[2.5rem] border border-app shadow-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-black/20 border-b border-app">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Title</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app">
                  {chapters.length > 0 ? chapters.map((ch) => (
                    <tr key={ch.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <p className="font-bold dark:text-white">{ch.title}</p>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">Chapter {ch.chapter_num}</p>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => openForm(ch)} className="p-3 text-slate-400 hover:text-primary"><Edit3 size={18} /></button>
                        <button onClick={() => { if(window.confirm("Delete?")) api.delete(`/admin/chapters/${ch.id}`).then(()=>fetchChapters(selectedTopic)) }} className="p-3 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="2" className="p-20 text-center text-slate-400 italic">No chapters configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY FORM (UNCHANGED FROM PREVIOUS VERSION) */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-[100] bg-app overflow-y-auto p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setShowAddForm(false)} className="mb-8 flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] hover:text-primary transition-colors"><X size={20}/> Cancel</button>
              <div className="bg-card p-10 rounded-[3rem] border border-app shadow-2xl">
                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter mb-8">{isEditing ? 'Edit Chapter' : 'Add New Chapter'}</h2>
                <form onSubmit={handleSave} className="space-y-6">
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="Chapter Title" />
                  <div className="grid grid-cols-2 gap-6">
                    <input type="number" required value={formData.chapter_num} onChange={e => setFormData({...formData, chapter_num: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="No." />
                    <input required value={formData.ncert_ref} onChange={e => setFormData({...formData, ncert_ref: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="NCERT Ref" />
                  </div>
                  <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase shadow-lg shadow-primary/20">Save Chapter</button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChapterCreator;