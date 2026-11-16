import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Users, BookOpen, PlayCircle, Star, Activity, Plus, Megaphone, Bell, ChevronRight, Clock, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_students: 0, total_subjects: 0, total_chapters: 0, total_simulations: 0, total_announcements: 0 });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, annRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/announcements/all')
        ]);
        
        if (statsRes.data.success) {
          setStats({
            ...statsRes.data.data.stats,
            total_announcements: statsRes.data.data.stats?.total_announcements || 0
          });
        }
        
        if (annRes.data.success) {
          // FIX: Look for 'announcements' key and check if it's an array before slicing
          const annList = annRes.data.data?.announcements || annRes.data.data || [];
          setRecentAnnouncements(Array.isArray(annList) ? annList.slice(0, 3) : []);
        }
      } catch (err) {
        console.error("Dashboard sync error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats.total_students, icon: <Users size={20}/>, color: 'text-blue-500' },
    { label: 'Live Subjects', value: stats.total_subjects, icon: <BookOpen size={20}/>, color: 'text-purple-500' },
    { label: 'Total Chapters', value: stats.total_chapters, icon: <Star size={20}/>, color: 'text-emerald-500' },
    { label: 'Announcements', value: stats.total_announcements || stats.total_announcements === 0 ? stats.total_announcements : 0, icon: <Megaphone size={20}/>, color: 'text-orange-500' },
  ];

  if (loading) return <div className="p-20 text-center font-bold text-primary animate-pulse uppercase tracking-widest text-xs">Syncing Command Center...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">Command Center</h1>
        <button onClick={() => navigate('/admin/announcements')} className="bg-slate-900 dark:bg-white dark:text-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg">
          <Plus size={18} /> Broadcast News
        </button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-3xl border border-app shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-slate-50 dark:bg-zinc-800 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <span className="text-[10px] font-black dark:text-zinc-500 text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <h3 className="text-3xl font-black dark:text-white text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <div className="bg-card border border-app rounded-[2.5rem] shadow-sm flex flex-col h-full">
              <div className="p-8 border-b border-app flex justify-between items-center">
                 <h2 className="text-xl font-black dark:text-white text-slate-800 uppercase tracking-tight">Live Broadcasts</h2>
                 <button onClick={() => navigate('/admin/announcements')} className="text-[10px] font-black text-primary uppercase hover:underline">View All</button>
              </div>
              <div className="p-4 space-y-4">
                 {recentAnnouncements.length > 0 ? recentAnnouncements.map((ann) => (
                   <div key={ann.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900/50 border border-app flex items-start gap-4">
                      <div className="p-3 bg-primary-glow text-primary rounded-xl shrink-0"><Bell size={20}/></div>
                      <div>
                         <h4 className="font-bold text-sm dark:text-white">{ann.title}</h4>
                         <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 mt-1">{ann.message}</p>
                         <div className="flex items-center gap-2 mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={12}/> {new Date(ann.created_at).toLocaleDateString()} • For: {ann.target_role}
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="p-20 text-center italic text-slate-400 text-sm">No announcements currently live.</div>
                 )}
              </div>
           </div>
        </div>
        <div className="bg-card border border-app p-8 rounded-[2.5rem] shadow-sm h-fit">
          <h2 className="text-xl font-bold dark:text-white text-slate-800 mb-6 uppercase tracking-tight">System Status</h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-app"><span className="text-xs font-bold text-slate-500">API Status</span><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Online</span></div>
             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-app"><span className="text-xs font-bold text-slate-500">Database</span><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Connected</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;