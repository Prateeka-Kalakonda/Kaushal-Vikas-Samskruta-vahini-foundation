import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  Activity, 
  BookOpen, 
  Clock,
  ShieldCheck
} from 'lucide-react';

const Progress = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Detail View States
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, [isAdmin]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      // API 1: GET /api/v1/mentors/performance
      const endpoint = isAdmin ? '/mentors/performance' : '/progress/completed';
      const res = await api.get(endpoint);
      
      // Strict data mapping from backend response
      const actualData = res.data?.data?.mentors || res.data?.data || [];
      setData(Array.isArray(actualData) ? actualData : []);
    } catch (err) {
      console.error("Performance List Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (mentor) => {
    // FIX: backend field is "mentor_id" not "id"
    const mentorId = mentor.mentor_id;
    setSelectedMentorId(mentorId);
    setMentorDetails(null);
    setLoadingDetails(true);
    try {
      // API 2: GET /api/v1/mentors/performance/:mentorId
      const res = await api.get(`/mentors/performance/${mentorId}`);
      if (res.data.success) {
        // Bind the exact data returned (mentor, students, recent_activity)
        setMentorDetails(res.data.data?.performance || res.data.data);
      }
    } catch (err) {
      console.error("Mentor Detail Error:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">Establishing Data Connection...</div>;

  // --- 1. ADMIN DETAIL VIEW: MENTOR DOSSIER ---
  if (isAdmin && selectedMentorId) {
    const details = mentorDetails;
    const mentorInfo = details?.mentor || {};
    // FIX: backend returns "students" not "assigned_students"
    const assignedStudents = details?.students || [];
    // FIX: backend returns "recent_activity" not "activity_logs"
    const activityLogs = details?.recent_activity || [];

    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
        <button 
          onClick={() => { setSelectedMentorId(null); setMentorDetails(null); }}
          className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] hover:text-primary transition-all"
        >
          <ChevronLeft size={16} /> Back to Mentor Rankings
        </button>

        {/* Mentor Header Card */}
        <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-lg shadow-primary/20">
              {mentorInfo.full_name?.charAt(0) || 'M'}
            </div>
            <div>
              <h2 className="text-3xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">
                {mentorInfo.full_name || "Mentor Details"}
              </h2>
              <p className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> Performance Oversight Active
              </p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last System Activity</p>
             <p className="font-bold dark:text-white">
               {activityLogs[0]?.created_at
                 ? new Date(activityLogs[0].created_at).toLocaleDateString()
                 : 'No recent activity'}
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Students Section */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-app shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs tracking-widest dark:text-white">
              <Users size={16} className="text-primary" /> Assigned Learners ({assignedStudents.length})
            </h3>
            <div className="space-y-4">
              {loadingDetails ? <p className="animate-pulse text-sm text-slate-400">Syncing student progress...</p> : 
               assignedStudents.length > 0 ? assignedStudents.map((student, i) => (
                <div key={student.id || i} className="p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-app flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm dark:text-zinc-200">{student.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Class {student.class_level || '12'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-black text-sm">{student.mastery_pct || 0}%</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Mastery</p>
                  </div>
                </div>
              )) : <p className="text-slate-500 italic text-sm p-4">No students currently linked to this mentor.</p>}
            </div>
          </div>

          {/* Activity Log Section */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-app shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs tracking-widest dark:text-white">
              <Activity size={16} className="text-primary" /> Mentor Oversight Log
            </h3>
            <div className="space-y-4">
               {loadingDetails ? <p className="animate-pulse text-sm text-slate-400">Retrieving logs...</p> :
                activityLogs.length > 0 ? activityLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl transition-colors">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="text-slate-700 dark:text-zinc-300 text-sm font-medium">
                      {log.action_type === 'view_progress'
                        ? `Viewed progress of ${log.student_name}`
                        : log.action_type}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                      <Clock size={10}/> {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) : <p className="text-slate-500 italic text-sm p-4">No activity history found.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. ADMIN MAIN VIEW: MENTOR RANKINGS ---
  if (isAdmin) return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black dark:text-white text-slate-800 uppercase tracking-tighter">Mentor Performance</h1>
        <p className="text-sm text-slate-500">Cross-referencing student outcomes with mentor monitoring activity.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {data.length > 0 ? data.map((item, idx) => (
          <div 
            key={item.mentor_id || idx} 
            onClick={() => handleOpenDetails(item)}
            className="bg-card p-8 rounded-[2.5rem] border border-app shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary transition-all cursor-pointer"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-bold text-xl dark:text-white group-hover:text-primary transition-colors">
                  Mentor: {item.mentor_name}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Specialization: {item.subject || 'General Sciences'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 flex-1 md:ml-20">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                <p className="text-lg font-black dark:text-white">{item.total_students || 0}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Checks</p>
                <p className="text-lg font-black text-primary">{item.students_checked_this_week || 0}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Mastery</p>
                <p className="text-lg font-black dark:text-white">{item.avg_student_mastery_pct || 0}%</p>
              </div>
            </div>
            
            <button className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-full text-slate-300 group-hover:text-primary group-hover:bg-primary-glow transition-all">
              <ChevronRight size={24} />
            </button>
          </div>
        )) : (
          <div className="p-20 text-center border-2 border-dashed border-app rounded-[3rem] text-slate-400">
            No mentor performance data found in the current period.
          </div>
        )}
      </div>
    </div>
  );

  // --- 3. STUDENT VIEW: CURRICULUM MASTERY ---
  return (
    <div className="space-y-10 animate-in fade-in">
       <header>
          <h1 className="text-3xl font-black dark:text-white text-slate-800 uppercase tracking-tighter">My Progress</h1>
          <p className="text-sm text-slate-500">Tracking your journey through the NCERT modules.</p>
       </header>
       <div className="bg-card p-12 rounded-[3rem] border border-app shadow-xl flex items-end justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-7xl font-black text-primary mb-2">{Math.min(100, Math.round((data.length / 20) * 100))}%</h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Curriculum Mastery Score</p>
          </div>
          <BarChart3 className="absolute right-[-20px] bottom-[-20px] text-primary opacity-5" size={240} />
       </div>
    </div>
  );
};

export default Progress;