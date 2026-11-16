import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { UserCheck, Users, Search, Save, ChevronRight } from 'lucide-react';

const AssignJobs = () => {
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const mRes = await api.get('/admin/users?role=mentor');
      const sRes = await api.get('/admin/users?role=student');
      setMentors(mRes.data.data || []);
      setStudents(sRes.data.data || []);
    };
    fetchData();
  }, []);

  const toggleStudent = (id) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleAssign = async () => {
    if(!selectedMentor || selectedStudents.length === 0) return alert("Select mentor and students first");
    try {
      await api.post('/admin/assign-students', { mentorId: selectedMentor, studentIds: selectedStudents });
      alert("Students assigned successfully!");
    } catch (err) { alert("Assignment failed."); }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in">
      <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Assign Jobs to Mentors</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mentor Selection */}
        <div className="bg-card p-8 rounded-[2.5rem] border border-app shadow-xl">
           <h3 className="text-[10px] font-black uppercase text-primary tracking-widest mb-6 flex items-center gap-2"><UserCheck size={16}/> 1. Select Mentor</h3>
           <div className="space-y-2">
             {mentors.map(m => (
               <button key={m.id} onClick={() => setSelectedMentor(m.id)} 
                 className={`w-full text-left p-4 rounded-2xl border transition-all font-bold text-sm ${selectedMentor === m.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-zinc-900 border-app dark:text-white'}`}>
                 {m.username || m.name}
               </button>
             ))}
           </div>
        </div>

        {/* Student Multi-Select */}
        <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] border border-app shadow-xl">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Users size={16}/> 2. Assign Students</h3>
             <span className="text-[10px] font-black text-slate-400">{selectedStudents.length} selected</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {students.map(s => (
               <div key={s.id} onClick={() => toggleStudent(s.id)} 
                 className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${selectedStudents.includes(s.id) ? 'bg-primary-glow border-primary text-primary' : 'bg-slate-50 dark:bg-zinc-900 border-app dark:text-zinc-400'}`}>
                 <span className="font-bold text-xs">{s.username || s.name}</span>
                 {selectedStudents.includes(s.id) && <Check size={14}/>}
               </div>
             ))}
           </div>
           <button onClick={handleAssign} className="w-full mt-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110">Confirm Assignment</button>
        </div>
      </div>
    </div>
  );
};

const Check = ({size}) => <div className="p-1 bg-primary text-white rounded-full"><Users size={size-2}/></div>;

export default AssignJobs;