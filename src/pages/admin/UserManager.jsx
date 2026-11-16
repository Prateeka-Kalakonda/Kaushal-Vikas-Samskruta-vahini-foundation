import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  UserPlus, Trash2, Edit, Mail, Phone, Shield, 
  GraduationCap, X, Check, Search, ChevronLeft, User, Eye, 
  Briefcase, ShieldCheck, UserCheck, UserMinus 
} from 'lucide-react';

const UserManager = ({ role: pageRole = 'all' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [activeFormRole, setActiveFormRole] = useState(
    pageRole === 'all' ? 'student' : pageRole.toLowerCase()
  );

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (pageRole !== 'all') {
      setActiveFormRole(pageRole.toLowerCase());
    }
    fetchUsers();
  }, [pageRole]);

  useEffect(() => {
    if (view === 'add') {
      const base = { 
        full_name: '', username: '', email: '', password: '', 
        mobile_no: '', role: activeFormRole, language: 'en' 
      };
      const studentFields = { age: '', class_level: '12', parent_mobile: '', school_name: '', board: 'CBSE' };
      const mentorFields = { subject: '', qualification: '', experience: '', bio: '' };

      setFormData({
        ...base,
        ...(activeFormRole === 'student' ? studentFields : {}),
        ...(activeFormRole === 'mentor' ? mentorFields : {})
      });
    }
  }, [activeFormRole, view]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = pageRole === 'all' ? '/profile/users' : `/profile/users?role=${pageRole.toLowerCase()}`;
      const res = await api.get(endpoint);
      const userData = res.data.data?.users || res.data.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) { 
      setUsers([]); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleOpenAddForm = () => {
    setSelectedUserId(null);
    setActiveFormRole(pageRole === 'all' ? 'student' : pageRole.toLowerCase());
    setView('add');
  };

  const handleEdit = async (userObj) => {
    try {
      // FIX: this GET route is correct and already exists
      const res = await api.get(`/profile/users/${userObj.id}`);
      const data = res.data.data || res.data;
      const u = data.user || data.profile;

      if (u) {
        setSelectedUserId(u.id);
        setActiveFormRole(u.role);

        const s_prof = u.student_profile || {};
        const m_prof = u.mentor_profile || {};

        setFormData({
          full_name: u.full_name || '',
          username: u.username || '',
          email: u.email || '',
          mobile_no: u.mobile_no || '',
          role: u.role,
          password: '',
          age: s_prof.age || '',
          class_level: s_prof.class_level || '12',
          school_name: s_prof.school_name || '',
          board: s_prof.board || 'CBSE',
          parent_mobile: s_prof.parent_mobile || '',
          subject: m_prof.subject || '',
          qualification: m_prof.qualification || '',
          experience: m_prof.experience || '',
          bio: m_prof.bio || ''
        });
        setView('edit');
      }
    } catch (err) { 
      alert("Error: Could not retrieve full user profile."); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (view === 'add') {
        // FIX: admin creation uses /admin/users not /auth/register
        await api.post('/admin/users', {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          username: formData.username,
          mobile_no: formData.mobile_no,
          language: formData.language || 'en',
          role: activeFormRole,
        });

        // Create-time academic/professional fields need the new user's id.
        // Fetch the just-created user by email to get its id, then attach profile data.
        if (activeFormRole === 'student' || activeFormRole === 'mentor') {
          const lookup = await api.get(`/profile/users?role=${activeFormRole}`);
          const list = lookup.data.data?.users || lookup.data.data || [];
          const created = list.find(u => u.email === formData.email);

          if (created) {
            if (activeFormRole === 'student') {
              await api.put(`/admin/users/${created.id}/student-profile`, {
                age: formData.age || null,
                class_level: formData.class_level,
                parent_mobile: formData.parent_mobile,
                school_name: formData.school_name,
                board: formData.board,
              });
            } else {
              await api.put(`/admin/users/${created.id}/mentor-profile`, {
                subject: formData.subject,
                qualification: formData.qualification,
                experience: formData.experience || null,
                bio: formData.bio,
              });
            }
          }
        }

        alert(`${activeFormRole.toUpperCase()} account created!`);
      } else {
        // FIX: correct admin update endpoint + only the fields it accepts
        await api.put(`/admin/users/${selectedUserId}`, {
          full_name: formData.full_name,
          username: formData.username,
          mobile_no: formData.mobile_no,
          language: formData.language || 'en',
        });

        // FIX: role-specific fields go to their own dedicated admin routes
        if (activeFormRole === 'student') {
          await api.put(`/admin/users/${selectedUserId}/student-profile`, {
            age: formData.age || null,
            class_level: formData.class_level,
            parent_mobile: formData.parent_mobile,
            school_name: formData.school_name,
            board: formData.board,
          });
        }

        if (activeFormRole === 'mentor') {
          await api.put(`/admin/users/${selectedUserId}/mentor-profile`, {
            subject: formData.subject,
            qualification: formData.qualification,
            experience: formData.experience || null,
            bio: formData.bio,
          });
        }

        alert("Dossier updated successfully!");
      }
      setView('list');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Internal Protocol Error.");
    }
  };

  const deleteUser = async (id) => {
    try {
      // FIX: correct admin delete endpoint
      await api.delete(`/admin/users/${id}`);
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) { 
      alert("Delete operation restricted."); 
    }
  };

  const handleAssignmentAction = async (type, mentor) => {
    const studentEmail = window.prompt(`Enter student email to ${type} with ${mentor.full_name}:`);
    if (!studentEmail) return;
    try {
      const sRes = await api.get(`/profile/users?search=${studentEmail}`);
      const student = sRes.data.data?.users?.[0] || sRes.data.data?.[0];
      if (!student) return alert("Student not found.");
      if (type === 'assign') {
        await api.post('/admin/users/assign-mentor', { mentor_id: mentor.id, student_id: student.id });
      } else {
        await api.delete('/admin/users/unassign-mentor', { data: { mentor_id: mentor.id, student_id: student.id } });
      }
      alert("Operation successful!");
    } catch (err) { alert("Assignment failed."); }
  };

  // --- FORM VIEW (Restored Two-Card UI) ---
  if (view !== 'list') return (
    <div className="max-w-6xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <button onClick={() => setView('list')} className="mb-6 text-slate-400 font-bold flex items-center gap-2 hover:text-primary transition-all uppercase text-[10px] tracking-widest">
        <ChevronLeft size={16}/> Return to Directory
      </button>

      <div className="flex flex-col gap-8">
        <h2 className="text-3xl font-black dark:text-white text-slate-800 uppercase tracking-tighter">
          {view === 'add' ? `Add New ${activeFormRole}` : `Edit ${activeFormRole} Profile`}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          {/* Card 1: Identity & Access */}
          <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl">
            <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <User size={16}/> Identity & Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Name</label>
                <input required value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Username</label>
                <input required value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  { (pageRole === 'all' && view === 'add') ? 'Account Role' : 'Fixed Role' }
                </label>
                {(pageRole === 'all' && view === 'add') ? (
                  <select value={activeFormRole} onChange={e => setActiveFormRole(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary">
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <input disabled value={activeFormRole.toUpperCase()} className="w-full p-4 bg-slate-100 dark:bg-black/20 border border-app rounded-2xl dark:text-white font-bold opacity-60 cursor-not-allowed" />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email ID</label>
                <input required disabled={view === 'edit'} type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mobile Number</label>
                <input value={formData.mobile_no || ''} onChange={e => setFormData({...formData, mobile_no: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
                <input required={view === 'add'} type="password" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary" placeholder={view === 'edit' ? "••••••••" : "Assign password"} />
              </div>
            </div>

            {activeFormRole === 'admin' && (
              <button type="submit" className="w-full mt-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all">
                {view === 'add' ? 'Initialize Admin' : 'Save Identity'}
              </button>
            )}
          </div>

          {/* Card 2: Student Specific */}
          {activeFormRole === 'student' && (
            <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl">
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <GraduationCap size={16}/> Student Academic Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Age</label>
                  <input type="number" value={formData.age || ''} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Class Level</label>
                  <select value={formData.class_level || '12'} onChange={e => setFormData({...formData, class_level: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold">
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Board</label>
                  <select value={formData.board || 'CBSE'} onChange={e => setFormData({...formData, board: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold">
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State">State</option>
                  </select>
                </div>
                <input placeholder="School Name" value={formData.school_name || ''} onChange={e => setFormData({...formData, school_name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold md:col-span-2" />
                <input placeholder="Parent Contact" value={formData.parent_mobile || ''} onChange={e => setFormData({...formData, parent_mobile: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold" />
              </div>
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">Save Student Data</button>
            </div>
          )}

          {/* Card 2: Mentor Specific */}
          {activeFormRole === 'mentor' && (
            <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl">
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Briefcase size={16}/> Mentor Professional Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <input placeholder="Subject" value={formData.subject || ''} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold" />
                <input placeholder="Qualification" value={formData.qualification || ''} onChange={e => setFormData({...formData, qualification: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold" />
                <textarea placeholder="Bio" value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold h-24 md:col-span-2" />
              </div>
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">Save Mentor Profile</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center px-4">
        <h1 className="text-3xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">
            {pageRole === 'all' ? 'Directory' : `${pageRole}s`}
        </h1>
        <button onClick={handleOpenAddForm} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] shadow-lg uppercase tracking-widest transition-transform hover:scale-105">
          <UserPlus size={18} /> New Account
        </button>
      </div>
      <div className="bg-card rounded-[2.5rem] border border-app shadow-2xl overflow-hidden mx-4">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-zinc-900/50 border-b border-app">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Identification</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Status</th>
              <th className="p-6 text-right text-[10px] font-black uppercase text-slate-400">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {loading ? (
              <tr><td colSpan="3" className="p-20 text-center text-primary font-bold animate-pulse uppercase">Syncing...</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                <td className="p-6">
                   <p className="font-bold dark:text-white text-slate-800">{u.full_name || u.username}</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">@{u.username}</p>
                </td>
                <td className="p-6 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border border-app ${u.role === 'admin' ? 'text-red-500 bg-red-500/5' : u.role === 'mentor' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary-glow text-primary'}`}>{u.role}</span>
                </td>
                <td className="p-6 text-right">
                  {confirmDelete === u.id ? (
                    <div className="flex items-center justify-end gap-2 bg-red-500/10 p-2 rounded-xl">
                       <button onClick={() => deleteUser(u.id)} className="p-2 bg-red-500 text-white rounded-lg"><Check size={12}/></button>
                       <button onClick={() => setConfirmDelete(null)} className="p-2 bg-slate-200 dark:bg-zinc-700 rounded-lg"><X size={12}/></button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                       {u.role === 'mentor' && (
                         <div className="flex gap-1 border-r border-app pr-2 mr-1">
                           <button onClick={() => handleAssignmentAction('assign', u)} className="p-2 text-slate-300 hover:text-emerald-500" title="Assign"><UserCheck size={18} /></button>
                           <button onClick={() => handleAssignmentAction('unassign', u)} className="p-2 text-slate-300 hover:text-orange-500" title="Unassign"><UserMinus size={18} /></button>
                         </div>
                       )}
                       <button onClick={() => handleEdit(u)} className="p-2 text-slate-300 hover:text-primary transition-all"><Eye size={18} /></button>
                       <button onClick={() => setConfirmDelete(u.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;