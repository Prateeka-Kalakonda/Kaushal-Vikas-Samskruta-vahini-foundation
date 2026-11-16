import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ChevronRight, Atom, Calculator, Beaker } from 'lucide-react';
import api from '../api/axios';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        
        // FLEXIBLE DATA PARSING:
        // This checks multiple possible locations for the array to ensure
        // subjects like Physics show up correctly.
        let actualData = [];
        if (Array.isArray(res.data)) {
          actualData = res.data;
        } else if (res.data?.success && Array.isArray(res.data.data)) {
          actualData = res.data.data;
        } else if (res.data?.data?.subjects && Array.isArray(res.data.data.subjects)) {
          actualData = res.data.data.subjects;
        } else if (res.data?.subjects && Array.isArray(res.data.subjects)) {
          actualData = res.data.subjects;
        }

        setSubjects(actualData);
      } catch (err) { 
        console.error("Failed to fetch student subjects:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchSubjects();
  }, []);

  const getSubjectIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes('physic')) return <Atom size={32} />;
    if (n.includes('chem')) return <Beaker size={32} />;
    if (n.includes('math')) return <Calculator size={32} />;
    return <Book size={32} />;
  };

  if (loading) return <div className="p-20 text-center text-primary font-bold animate-pulse">Loading Syllabus...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <header>
        <h1 className="text-3xl font-bold dark:text-white text-slate-800">Your Subjects</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Select a domain to begin your interactive session.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length > 0 ? (
          subjects.map((sub) => (
            <div 
              key={sub.id} 
              onClick={() => navigate(`/subjects/${sub.slug || sub.id}`)}
              className="bg-card p-8 rounded-[2.5rem] border border-app shadow-sm hover:shadow-xl hover:border-primary transition-all cursor-pointer group"
            >
              <div className="mb-6 w-14 h-14 rounded-2xl bg-primary-glow flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {getSubjectIcon(sub.name || sub.title)}
              </div>
              <h3 className="text-xl font-bold dark:text-white text-slate-800 mb-1 group-hover:text-primary transition-colors">
                {sub.name || sub.title}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                Class {sub.class_level || '11/12'} Syllabus
              </p>
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                Explore Topics <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-app rounded-[2.5rem] text-slate-400">
            <Layers className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-bold uppercase tracking-widest text-xs">No subjects published yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;