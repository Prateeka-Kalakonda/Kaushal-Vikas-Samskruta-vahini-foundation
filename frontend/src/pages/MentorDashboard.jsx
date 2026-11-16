import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Megaphone, Users, BookOpen, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const res = await api.get('/announcements');
        const announcements = res.data.data?.announcements || res.data.data || [];
        if (announcements.length > 0) {
          setLatestUpdate(announcements[0]); // Take the newest one
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold dark:text-white text-slate-800">Hello, Mentor! 👋</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 italic">
          Empowering the next generation of researchers.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MINI UPDATES CARD (Replaces Progress) */}
        <div className="bg-card p-7 rounded-[2rem] border border-app shadow-sm md:col-span-2 group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2.5 bg-primary-glow rounded-xl text-primary"><Megaphone size={24} /></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Announcement</span>
          </div>
          
          {latestUpdate ? (
            <div className="space-y-2">
              <h3 className="text-xl font-black dark:text-white">{latestUpdate.title}</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {latestUpdate.message}
              </p>
              <button 
                onClick={() => navigate('/updates')}
                className="mt-4 text-xs font-black text-primary uppercase tracking-widest hover:underline"
              >
                Read Full Broadcast
              </button>
            </div>
          ) : (
            <p className="text-slate-400 italic text-sm py-4">No recent announcements found.</p>
          )}
        </div>

        {/* QUICK STATS (Assigned Students) */}
        <div className="bg-card p-7 rounded-[2rem] border border-app shadow-sm flex flex-col justify-center text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/mentor/students')}>
           <div className="w-12 h-12 bg-primary-glow rounded-full mx-auto flex items-center justify-center text-primary mb-4">
              <Users size={24} />
           </div>
           <h3 className="text-3xl font-black dark:text-white">--</h3>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Assigned Students</p>
        </div>
      </div>

      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          <h2 className="text-xl font-bold dark:text-white text-slate-800">Your Activity</h2>
        </div>
        <div className="p-12 text-center border-2 border-dashed border-app rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest text-xs">
          Select a subject below to start reviewing content.
        </div>
      </section>
    </div>
  );
};

export default MentorDashboard;