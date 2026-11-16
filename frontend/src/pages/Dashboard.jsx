import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ completed: 0, continuing: [] });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [comp, cont] = await Promise.all([api.get('/progress/completed'), api.get('/progress/continue-reading')]);
        setStats({ completed: comp.data?.data?.length || 0, continuing: cont.data?.data || [] });
      } catch (err) { console.error(err); }
    };
    fetchDashboard();
  }, []);

  const totalChapters = 20;
  const progressPercent = Math.min(100, Math.round((stats.completed / totalChapters) * 100));

  return (
    <div className="space-y-8 animate-in fade-in">
      <section>
        <h1 className="text-3xl font-bold dark:text-white text-slate-800">Hello, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 italic">"The expert in anything was once a beginner."</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-7 rounded-[2rem] border border-app shadow-sm hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-6">
             <div className="p-2.5 bg-primary-glow rounded-xl text-primary"><TrendingUp size={24} /></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
          </div>
          <h3 className="text-5xl font-black text-primary transition-all">{progressPercent}%</h3>
          <p className="text-xs font-bold text-slate-400 uppercase mt-2">Curriculum Mastery</p>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full mt-5 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-card p-7 rounded-[2rem] border border-app shadow-sm hover:shadow-lg transition-all">
          <div className="flex justify-between items-start mb-6">
             <div className="p-2.5 bg-primary-glow rounded-xl text-primary"><BookOpen size={24} /></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery</span>
          </div>
          <h3 className="text-5xl font-black dark:text-white text-slate-900">{stats.completed}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase mt-2">Chapters Validated</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          <h2 className="text-xl font-bold dark:text-white text-slate-800">Continue Reading</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.continuing.length > 0 ? stats.continuing.map(item => (
            <div key={item.id} className="bg-card p-5 rounded-2xl border border-app hover:border-primary transition-all cursor-pointer flex gap-4">
              <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-primary"><BookOpen size={20} /></div>
              <div>
                <h4 className="font-bold text-sm dark:text-white">{item.chapter_name}</h4>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{item.subject_name}</p>
              </div>
            </div>
          )) : <div className="col-span-2 py-12 text-center border-2 border-dashed border-app rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest text-xs">No active sessions</div>}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;