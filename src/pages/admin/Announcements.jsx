import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Megaphone, Plus, Trash2, Send, X, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', target_role: 'all' });

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/all');
      // FIXED PARSING: Looking for res.data.data.announcements
      if (res.data && res.data.data && Array.isArray(res.data.data.announcements)) {
        setAnnouncements(res.data.data.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch (err) { console.error("Admin fetch failed", err); }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/announcements', formData);
      setFormData({ title: '', message: '', target_role: 'all' });
      setShowAdd(false);
      fetchAnnouncements();
    } catch (err) { alert("Publish failed"); }
    finally { setLoading(false); }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Remove broadcast?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <header className="flex justify-between items-center bg-card p-6 rounded-[2rem] border border-app shadow-sm">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">Broadcast Center</h1>
          <p className="text-sm font-medium text-slate-500 italic">Push real-time notifications to the platform.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
          + New Broadcast
        </button>
      </header>

      {/* ANNOUNCEMENT LIST (Visible to Admin) */}
      <div className="space-y-4">
        {announcements.length > 0 ? announcements.map((item) => (
          <div key={item.id} className="bg-card p-6 rounded-[2rem] border border-app flex items-center gap-6 group hover:border-primary transition-all">
            <div className="w-14 h-14 bg-primary-glow rounded-2xl flex items-center justify-center text-primary shrink-0">
               <Megaphone size={28} />
            </div>
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg dark:text-white text-slate-800">{item.title}</h3>
                  {/* TARGET IS VISIBLE HERE FOR ADMINS */}
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20 text-primary bg-primary/5">
                    Target: {item.target_role}
                  </span>
               </div>
               <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-1">{item.message}</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-[10px] font-bold text-slate-400 uppercase"><Clock size={12} className="inline mr-1"/> {new Date(item.created_at).toLocaleDateString()}</div>
               <button onClick={() => deleteAnnouncement(item.id)} className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl hover:text-red-500 transition-all">
                 <Trash2 size={18}/>
               </button>
            </div>
          </div>
        )) : (
          <div className="p-24 text-center border-2 border-dashed border-app rounded-[3rem] text-slate-400 font-bold uppercase tracking-widest text-xs">
            No active announcements found in database.
          </div>
        )}
      </div>

      {/* FORM OVERLAY (Logic remains the same as previous) */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card w-full max-w-xl p-10 rounded-[3rem] border border-app shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Draft Message</h2>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-red-500"><X /></button>
              </div>
              <form onSubmit={handlePublish} className="space-y-6">
                <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" />
                <textarea required placeholder="Message" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white h-32" />
                <select value={formData.target_role} onChange={e => setFormData({...formData, target_role: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold">
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="mentor">Mentors Only</option>
                  <option value="admin">Admins Only</option>
                </select>
                <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase shadow-xl">{loading ? 'Publishing...' : 'Publish Announcement'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Announcements;