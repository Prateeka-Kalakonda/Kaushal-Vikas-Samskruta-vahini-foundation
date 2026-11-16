import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { User, ShieldCheck, Mail, Phone, Lock, Save } from 'lucide-react';

const AdminProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    mobile_no: user?.mobile_no || ''
  });
  const [passwords, setPass] = useState({ current_password: '', new_password: '' });

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profile', formData);
      alert("Profile updated successfully!");
    } catch (err) { alert("Update failed"); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profile/password', passwords);
      setPass({ current_password: '', new_password: '' });
      alert("Security Key updated!");
    } catch (err) { alert("Verification failed"); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter">System Administrator Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-card p-10 rounded-[3rem] border border-app shadow-xl text-center h-fit">
          <div className="w-24 h-24 bg-primary-glow rounded-full mx-auto mb-4 flex items-center justify-center text-primary border-4 border-app">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-xl font-bold dark:text-white">{user?.full_name}</h2>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Super User</p>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* PERSONAL INFO */}
          <form onSubmit={updateProfile} className="bg-card p-8 rounded-[3rem] border border-app shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white flex items-center gap-2"><User size={18} className="text-primary"/> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="Full Name" />
               <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="Username" />
            </div>
            <input value={formData.mobile_no} onChange={e => setFormData({...formData, mobile_no: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="Mobile Number" />
            <button type="submit" className="px-8 py-3 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg">Update Profile</button>
          </form>

          {/* SECURITY */}
          <form onSubmit={changePassword} className="bg-card p-8 rounded-[3rem] border border-app shadow-sm space-y-6">
            <h3 className="font-bold dark:text-white flex items-center gap-2"><Lock size={18} className="text-red-500"/> Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="password" value={passwords.current_password} onChange={e => setPass({...passwords, current_password: e.target.value})} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="Current Password" />
               <input type="password" value={passwords.new_password} onChange={e => setPass({...passwords, new_password: e.target.value})} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-app rounded-2xl dark:text-white font-bold" placeholder="New Password" />
            </div>
            <button type="submit" className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[10px] tracking-widest">Change Security Key</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;