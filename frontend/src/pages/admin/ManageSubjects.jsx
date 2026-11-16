import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, Trash2, Edit, AlertCircle, RefreshCw, Save, X, Book 
} from 'lucide-react';
import { motion } from 'framer-motion';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [classNum, setClassNum] = useState('12');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for Editing
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/subjects');
      if (res.data.success) {
        // Handling potential nested data structures from backend
        const data = res.data.data;
        setSubjects(Array.isArray(data) ? data : (data.subjects || []));
      }
    } catch (err) {
      setError("Failed to sync subjects with the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      if (editingId) {
        // --- UPDATE EXISTING ---
        await api.put(`/admin/subjects/${editingId}`, { 
          name: name,
          class_level: parseInt(classNum) 
        });
        setEditingId(null);
      } else {
        // --- CREATE NEW ---
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        await api.post('/subjects', { 
          name: name,
          slug: slug,
          class_level: parseInt(classNum),
          description: `NCERT Class ${classNum} ${name}`
        });
      }
      setName('');
      fetchSubjects(); // Refresh the table
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setClassNum(subject.class_level.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setClassNum('12');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("CRITICAL ACTION: Are you sure? This will remove all associated topics and chapters.")) return;
    
    try {
      await api.delete(`/admin/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert("Delete failed. Check server restrictions.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Manage Subjects</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Define the core curriculum domains.</p>
        </div>
        <button onClick={fetchSubjects} className="p-2 text-slate-400 hover:text-primary transition-colors">
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ERROR FEEDBACK */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* SUBJECT INPUT FORM */}
      <div className={`p-6 rounded-[2.5rem] border transition-all ${editingId ? 'bg-primary-glow border-primary' : 'bg-card border-app'} shadow-sm`}>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest ml-1">
              {editingId ? 'Updating Subject' : 'Create New Subject'}
            </label>
            <div className="relative">
              <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl outline-none focus:ring-1 focus:ring-primary dark:text-white font-bold"
                placeholder="e.g. Organic Chemistry" 
                required
              />
            </div>
          </div>
          
          <div className="w-full md:w-48 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest ml-1">Class Level</label>
            <select 
              value={classNum} 
              onChange={(e) => setClassNum(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl outline-none font-bold dark:text-white cursor-pointer"
            >
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="p-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-2xl hover:bg-slate-300 transition-all"
              >
                <X size={24} />
              </button>
            )}
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 md:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {editingId ? 'Update' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>

      {/* SUBJECTS TABLE */}
      <div className="bg-card rounded-[2.5rem] border border-app shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-black/20 border-b border-app">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject Name</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Class Level</th>
              <th className="p-6 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {subjects.length > 0 ? subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                <td className="p-6">
                  <p className="font-bold dark:text-white text-slate-800">{sub.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">ID: {sub.id.slice(0,8)}...</p>
                </td>
                <td className="p-6 text-center">
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary-glow text-primary border border-primary/10">
                    Grade {sub.class_level}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(sub)}
                      className="p-3 text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="p-20 text-center text-slate-400 italic font-medium">
                  No subjects found. Use the form above to start building the curriculum.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ManageSubjects;