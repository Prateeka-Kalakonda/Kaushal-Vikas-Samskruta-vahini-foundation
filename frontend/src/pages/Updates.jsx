import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Megaphone, Clock, Bell, AlertCircle } from 'lucide-react';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      
      // Data parsing to match: res.data.data.announcements
      if (res.data && res.data.data && Array.isArray(res.data.data.announcements)) {
        setUpdates(res.data.data.announcements);
      } else {
        setUpdates([]);
      }
    } catch (err) {
      setError("Could not load announcements.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Syncing Updates...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in">
      <header>
        <h1 className="text-3xl font-black dark:text-white text-slate-900 flex items-center gap-3">
          <Bell className="text-primary" size={32} /> Latest Updates
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">Notifications from the NCERT AI Laboratory.</p>
      </header>

      <div className="space-y-4">
        {updates.length > 0 ? (
          updates.map((item) => (
            <div key={item.id} className="bg-card p-6 rounded-[2rem] border border-app shadow-sm flex items-start gap-6 hover:border-primary transition-all">
              <div className="w-14 h-14 bg-primary-glow rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Megaphone size={28} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg dark:text-white text-slate-800">{item.title}</h3>
                  <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <Clock size={12} /> {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">{item.message}</p>
                <div className="mt-4">
                   <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {item.created_by_name || 'Administrator'}
                   </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center bg-card rounded-[3rem] border-2 border-dashed border-app text-slate-400 font-bold uppercase tracking-widest text-xs">
            No updates live yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Updates;