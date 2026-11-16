import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Users, ChevronRight, ChevronLeft, CheckCircle, 
  BookOpen, BarChart3, Clock, Activity, AlertCircle 
} from 'lucide-react';

const MentorStudents = () => {
  // Initialize as empty array to prevent .map crashes
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Drill-down states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [fetchingProgress, setFetchingProgress] = useState(false);

  useEffect(() => { 
    fetchMyStudents(); 
  }, []);

  const fetchMyStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      // API 1: GET /api/v1/mentors/my-students
      const res = await api.get('/mentors/my-students');
      
      // ROBUST PARSER: Check every possible location for the student array
      let actualData = [];
      if (res.data?.data?.students && Array.isArray(res.data.data.students)) {
        actualData = res.data.data.students;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        actualData = res.data.data;
      } else if (Array.isArray(res.data)) {
        actualData = res.data;
      }

      setStudents(actualData);
    } catch (err) {
      console.error("Failed to fetch assigned students:", err);
      setError("Unable to load assigned students. Please verify backend connection.");
      setStudents([]); // Ensure it stays an array
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgress = async (student) => {
    setSelectedStudent(student);
    setFetchingProgress(true);
    setProgress(null); // Reset previous progress data
    try {
      // API 2: GET /api/v1/mentors/my-students/:studentId/progress
      const res = await api.get(`/mentors/my-students/${student.id}/progress`);
      if (res.data.success) {
        setProgress(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching student progress:", err);
    } finally {
      setFetchingProgress(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">ESTABLISHING STUDENT DIRECTORY...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {!selectedStudent ? (
        <>
          {/* --- LIST VIEW --- */}
          <header>
            <h1 className="text-3xl font-black dark:text-white text-slate-800 uppercase tracking-tighter">My Students</h1>
            <p className="text-sm text-slate-500 font-medium">Review and monitor the progress of students under your guidance.</p>
          </header>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(students) && students.length > 0 ? (
              students.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => handleViewProgress(s)} 
                  className="bg-card p-6 rounded-[2.5rem] border border-app hover:border-primary transition-all cursor-pointer group flex items-center justify-between shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-glow rounded-2xl flex items-center justify-center text-primary font-bold">
                      {s.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold dark:text-white text-slate-800">{s.full_name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {s.class_level ? `Class ${s.class_level}` : 'Student'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-app rounded-[3rem] text-slate-400">
                <Users className="mx-auto mb-4 opacity-20" size={48} />
                <p className="font-bold uppercase tracking-widest text-xs">No students currently assigned to you.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* --- PROGRESS DETAIL VIEW --- */
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => { setSelectedStudent(null); setProgress(null); }} 
            className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] hover:text-primary transition-colors"
          >
            <ChevronLeft size={16}/> Back to Student List
          </button>
          
          <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary-glow rounded-full flex items-center justify-center text-primary">
                <BarChart3 size={32}/>
              </div>
              <div>
                <h2 className="text-3xl font-black dark:text-white text-slate-800 uppercase tracking-tighter">
                  {selectedStudent.full_name}
                </h2>
                <p className="text-primary font-bold text-xs uppercase tracking-widest">
                  Curriculum Mastery: {progress?.mastery_percentage || 0}%
                </p>
              </div>
            </div>
            <div className="text-right">
                <span className="bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-[9px] font-black uppercase text-slate-500">
                    ID: {selectedStudent.id.slice(0, 8)}
                </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subject Breakdown Card */}
            <div className="bg-card p-8 rounded-[2.5rem] border border-app shadow-sm">
               <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs tracking-widest dark:text-white">
                 <BookOpen size={16} className="text-primary"/> Subject Performance
               </h3>
               <div className="space-y-4">
                  {fetchingProgress ? (
                    <p className="p-4 text-center text-slate-400 animate-pulse text-xs">Fetching breakdown...</p>
                  ) : progress?.subject_breakdown?.length > 0 ? progress.subject_breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-app">
                      <span className="font-bold text-sm dark:text-zinc-300">{item.subject}</span>
                      <span className="text-primary font-black text-sm">{item.completed}/{item.total} Units</span>
                    </div>
                  )) : (
                    <p className="text-slate-400 italic text-sm p-4">No subject data available.</p>
                  )}
               </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-card p-8 rounded-[2.5rem] border border-app shadow-sm">
               <h3 className="font-bold mb-6 flex items-center gap-2 uppercase text-xs tracking-widest dark:text-white">
                 <Activity size={16} className="text-primary"/> Recent Activity
               </h3>
               <div className="space-y-4">
                  {fetchingProgress ? (
                    <p className="p-4 text-center text-slate-400 animate-pulse text-xs">Updating timeline...</p>
                  ) : progress?.recent_activity?.length > 0 ? progress.recent_activity.map((act, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm p-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                      <div>
                        <p className="text-slate-500 dark:text-zinc-400">
                          <span className="font-bold dark:text-white">{act.chapter_name}</span> 
                          <span className="ml-2">completed</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {new Date(act.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-400 italic text-sm p-4">No recent activity found.</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorStudents;