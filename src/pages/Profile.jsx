import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  User, Mail, Phone, Save, GraduationCap, Shield, 
  Award, BookOpen, Lock, RefreshCw, Calendar, Clock 
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Form States
  const [commonForm, setCommonForm] = useState({ full_name: '', username: '', mobile_no: '' });
  const [studentForm, setStudentForm] = useState({ age: '', class_level: '', school_name: '', board: 'CBSE' });
  const [mentorForm, setMentorForm] = useState({ subject: '', qualification: '', experience: '', bio: '' });
  
  // NEW: Password Change State
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/profile');
        if (res.data.success) {
          const p = res.data.data.profile;
          setProfileData(p);
          setCommonForm({
            full_name: p.full_name || '',
            username: p.username || '',
            mobile_no: p.mobile_no || ''
          });
          if (p.role === 'student') setStudentForm(p.student_profile || {});
          if (p.role === 'mentor') setMentorForm(p.mentor_profile || {});
        }
      } catch (err) { console.error("Fetch failed"); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (endpoint, data, label) => {
    try {
      await api.put(endpoint, data);
      alert(`${label} synchronized successfully!`);
    } catch (err) {
      alert("Verification failed. Check connectivity.");
    }
  };

  // NEW: Password Update Logic
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwordForm.current_password || !passwordForm.new_password) return;
    setIsUpdatingPass(true);
    try {
      const res = await api.put('/profile/password', passwordForm);
      if (res.data.success) {
        alert("Security Key updated successfully!");
        setPasswordForm({ current_password: '', new_password: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Password update failed. Verify current credentials.");
    } finally {
      setIsUpdatingPass(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-primary font-black animate-pulse">RE-ESTABLISHING IDENTITY...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in pb-20">
      
      {/* Header Section */}
      <header className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-primary-glow rounded-full flex items-center justify-center text-primary border-4 border-app shadow-xl">
            <User size={48} />
          </div>
          {profileData?.role === 'mentor' && profileData?.mentor_profile?.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-app">
              <Award size={16} />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-black dark:text-white text-slate-900 uppercase tracking-tighter">
            {commonForm.full_name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {profileData?.role}
            </span>
            <span className="text-slate-400 text-xs font-bold flex items-center gap-1 uppercase tracking-widest">
              <Clock size={14} /> Joined {new Date(profileData?.created_at).getFullYear()}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Account Identity (Always Visible) */}
        <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl space-y-8">
          <h3 className="font-bold dark:text-white flex items-center gap-3 text-slate-800 uppercase text-xs tracking-widest">
            <Shield size={20} className="text-primary"/> Account Identity
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdate('/profile', commonForm, "Identity"); }} className="space-y-5">
            <input value={commonForm.full_name} onChange={e => setCommonForm({...commonForm, full_name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary" placeholder="Full Name" />
            <input value={commonForm.username} onChange={e => setCommonForm({...commonForm, username: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary" placeholder="Username" />
            <input value={commonForm.mobile_no} onChange={e => setCommonForm({...commonForm, mobile_no: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none" placeholder="Add mobile number" />
            <button type="submit" className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Update Identity</button>
          </form>
        </div>

        {/* Card 2: Role Specific Details */}
        {profileData?.role === 'student' && (
          <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl space-y-8">
            <h3 className="font-bold dark:text-white flex items-center gap-3 text-slate-800 uppercase text-xs tracking-widest">
              <GraduationCap size={20} className="text-primary"/> Academic Credentials
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate('/profile/student', studentForm, "Academic Records"); }} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Age" value={studentForm.age} onChange={e => setStudentForm({...studentForm, age: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold" />
                <select value={studentForm.class_level} onChange={e => setStudentForm({...studentForm, class_level: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold">
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
              <input placeholder="School Name" value={studentForm.school_name} onChange={e => setStudentForm({...studentForm, school_name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold" />
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all">Save Student Profile</button>
            </form>
          </div>
        )}

        {profileData?.role === 'mentor' && (
          <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl space-y-8">
            <h3 className="font-bold dark:text-white flex items-center gap-3 text-slate-800 uppercase text-xs tracking-widest">
              <BookOpen size={20} className="text-primary"/> Mentor Expertise
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate('/profile/mentor', mentorForm, "Mentor Profile"); }} className="space-y-5">
              <input placeholder="Subject" value={mentorForm.subject} onChange={e => setMentorForm({...mentorForm, subject: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold" />
              <textarea placeholder="Professional Bio" value={mentorForm.bio} onChange={e => setMentorForm({...mentorForm, bio: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold h-24" />
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all">Save Mentor Data</button>
            </form>
          </div>
        )}

        {/* Card 3: Change Password (VISIBLE TO EVERYONE) */}
        <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl space-y-8 lg:col-span-2">
           <h3 className="font-bold dark:text-white flex items-center gap-3 text-slate-800 uppercase text-xs tracking-widest">
              <Lock size={20} className="text-red-500"/> Security Management
           </h3>
           <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Current Security Key</label>
                <input required type="password" value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})} 
                  className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-red-400" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">New Security Key</label>
                <input required type="password" value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} 
                  className="w-full p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl dark:text-white font-bold outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={isUpdatingPass} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                {isUpdatingPass ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {isUpdatingPass ? 'Validating...' : 'Update Password'}
              </button>
           </form>
           <p className="text-[10px] text-slate-400 italic">Ensure your new password contains a mix of alphanumeric characters for maximum security.</p>
        </div>

      </div>
    </div>
  );
};

export default Profile;