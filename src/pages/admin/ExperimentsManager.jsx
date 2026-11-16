import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, Edit3, ChevronLeft, Save, 
  FlaskConical, Layers, X, ClipboardList, 
  AlertTriangle, Clock, Gauge, Link2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ExperimentsManager = () => {
  const navigate = useNavigate();

  // --- DATA STATES ---
  const [experiments, setExperiments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  // --- UI STATES ---
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');

  // --- FORM STATES ---
  const [formData, setFormData] = useState({
    id: '',
    subject_id: '',
    chapter_id: '',
    simulation_id: '',
    title: '',
    description: '',
    experiment_type: 'virtual', // virtual, physical, hybrid
    difficulty: 'medium',       // easy, medium, hard
    duration_mins: 30,
    materials: [''],
    procedure: [''],
    expected_results: '',
    safety_notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [expRes, subRes] = await Promise.all([
        api.get('/experiments'),
        api.get('/subjects')
      ]);
      setExperiments(Array.isArray(expRes.data.data) ? expRes.data.data : []);
      setSubjects(Array.isArray(subRes.data.data) ? subRes.data.data : []);
    } catch (err) { console.error("Initial fetch failed"); }
  };

  const handleSubjectSelect = async (subId) => {
    setFormData({ ...formData, subject_id: subId, chapter_id: '' });
    if (!subId) return;
    try {
      // Find slug to fetch chapters
      const sub = subjects.find(s => s.id === subId);
      const res = await api.get(`/subjects/${sub.slug}/topics`); // Backend hierarchy
      // In this context, we'll assume we need chapters from these topics
      setChapters(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) { console.error("Chapter fetch failed"); }
  };

  // --- DYNAMIC LIST LOGIC ---
  const handleListUpdate = (index, value, type) => {
    const newList = [...formData[type]];
    newList[index] = value;
    setFormData({ ...formData, [type]: newList });
  };

  const addListItem = (type) => {
    setFormData({ ...formData, [type]: [...formData[type], ''] });
  };

  const removeListItem = (index, type) => {
    const newList = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: newList });
  };

  // --- CRUD ACTIONS ---
  const openForm = (exp = null) => {
    if (exp) {
      setIsEditing(true);
      setFormData({
        ...exp,
        materials: Array.isArray(exp.materials) ? exp.materials : [''],
        procedure: Array.isArray(exp.procedure) ? exp.procedure : ['']
      });
    } else {
      setIsEditing(false);
      setFormData({
        subject_id: '', chapter_id: '', simulation_id: '', title: '', description: '',
        experiment_type: 'virtual', difficulty: 'medium', duration_mins: 30,
        materials: [''], procedure: [''], expected_results: '', safety_notes: ''
      });
    }
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/experiments/${formData.id}`, formData);
      } else {
        await api.post('/experiments', formData);
      }
      setShowForm(false);
      fetchInitialData();
    } catch (err) { alert("Save failed. Verify all fields."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center bg-card p-6 rounded-[2rem] border border-app shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-100 rounded-full dark:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Laboratory Manager</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Manage Experiments & Protocols</p>
          </div>
        </div>
        <button onClick={() => openForm()} className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus size={18} /> New Experiment
        </button>
      </header>

      {/* FILTER BAR */}
      <div className="bg-card p-4 rounded-3xl border border-app shadow-sm flex items-center gap-4 px-6">
        <Search className="text-slate-400" size={20} />
        <select 
          className="bg-transparent border-none outline-none dark:text-white font-bold text-sm"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* EXPERIMENT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiments.length > 0 ? experiments.map((exp) => (
          <div key={exp.id} className="bg-card p-6 rounded-[2.5rem] border border-app shadow-xl group hover:border-primary transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-primary-glow rounded-2xl text-primary"><FlaskConical size={24}/></div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                  exp.difficulty === 'hard' ? 'border-red-500 text-red-500' : 
                  exp.difficulty === 'medium' ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-500'
                }`}>
                  {exp.difficulty}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{exp.experiment_type}</span>
              </div>
            </div>
            <h3 className="text-lg font-bold dark:text-white mb-2 line-clamp-1">{exp.title}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 line-clamp-2">{exp.description}</p>
            
            <div className="flex justify-between items-center pt-4 border-t border-app">
              <div className="flex items-center gap-3">
                <button onClick={() => openForm(exp)} className="text-slate-400 hover:text-primary transition-colors"><Edit3 size={18}/></button>
                <button onClick={() => {if(window.confirm("Delete experiment?")) api.delete(`/experiments/${exp.id}`).then(fetchInitialData)}} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                <Clock size={12}/> {exp.duration_mins}m
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-app rounded-[3rem] text-slate-400">
            No experiments found. Click "New Experiment" to start.
          </div>
        )}
      </div>

      {/* FULL PAGE OVERLAY FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-[100] bg-app overflow-y-auto p-6 md:p-12"
          >
            <div className="max-w-5xl mx-auto pb-20">
              <button onClick={() => setShowForm(false)} className="mb-8 flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] hover:text-primary">
                <X size={20}/> Cancel
              </button>

              <div className="bg-card p-10 rounded-[3.5rem] border border-app shadow-2xl">
                <h2 className="text-4xl font-black dark:text-white tracking-tighter uppercase mb-10">
                  {isEditing ? 'Modify Protocol' : 'New Lab Protocol'}
                </h2>

                <form onSubmit={handleSave} className="space-y-10">
                  {/* BASIC INFO */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Experiment Title</label>
                      <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="e.g. Acid-Base Titration" />
                      
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 block">Description</label>
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white h-24" placeholder="Brief overview of the experiment..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-fit">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type</label>
                        <select value={formData.experiment_type} onChange={e => setFormData({...formData, experiment_type: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold">
                          <option value="virtual">Virtual</option>
                          <option value="physical">Physical</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Difficulty</label>
                        <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold">
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Duration (Mins)</label>
                        <input type="number" value={formData.duration_mins} onChange={e => setFormData({...formData, duration_mins: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" />
                      </div>
                    </div>
                  </section>

                  {/* LINKING SECTION */}
                  <section className="p-8 border border-primary/20 bg-primary-glow/5 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-3"><h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2"><Link2 size={16}/> Curriculum Linkage</h4></div>
                    <select value={formData.subject_id} onChange={e => handleSubjectSelect(e.target.value)} className="p-4 bg-card border border-app rounded-2xl dark:text-white font-bold text-sm"><option value="">Subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                    <select value={formData.chapter_id} onChange={e => setFormData({...formData, chapter_id: e.target.value})} className="p-4 bg-card border border-app rounded-2xl dark:text-white font-bold text-sm"><option value="">Chapter</option>{chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
                    <input placeholder="Simulation ID (Optional)" value={formData.simulation_id} onChange={e => setFormData({...formData, simulation_id: e.target.value})} className="p-4 bg-card border border-app rounded-2xl dark:text-white text-sm" />
                  </section>

                  {/* DYNAMIC LISTS: MATERIALS & PROCEDURE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex justify-between"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList size={16}/> Materials</h4><button type="button" onClick={() => addListItem('materials')} className="text-primary font-black text-[10px]">+ ADD</button></div>
                      {formData.materials.map((m, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={m} onChange={e => handleListUpdate(i, e.target.value, 'materials')} className="flex-1 p-3 bg-slate-50 dark:bg-zinc-900 border border-app rounded-xl text-sm dark:text-white" placeholder={`Material ${i+1}`} />
                          <button type="button" onClick={() => removeListItem(i, 'materials')} className="text-red-400 p-2"><X size={16}/></button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Gauge size={16}/> Procedure Steps</h4><button type="button" onClick={() => addListItem('procedure')} className="text-primary font-black text-[10px]">+ ADD</button></div>
                      {formData.procedure.map((p, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="p-3 text-xs font-black text-slate-300">{i+1}.</span>
                          <textarea value={p} onChange={e => handleListUpdate(i, e.target.value, 'procedure')} className="flex-1 p-3 bg-slate-50 dark:bg-zinc-900 border border-app rounded-xl text-sm dark:text-white" placeholder="Step description..." />
                          <button type="button" onClick={() => removeListItem(i, 'procedure')} className="text-red-400 p-2"><X size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={16} className="text-orange-500"/> Safety & Observations</h4>
                    <textarea value={formData.safety_notes} onChange={e => setFormData({...formData, safety_notes: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white" placeholder="Enter safety warnings here..." />
                    <textarea value={formData.expected_results} onChange={e => setFormData({...formData, expected_results: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-medium" placeholder="Describe the expected results..." />
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[0.99] transition-all">
                    {loading ? 'Processing Protocol...' : 'Finalize and Publish Lab'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperimentsManager;