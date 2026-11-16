import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, User, Users, ShieldCheck, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(''); 
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRoleSelect = (role) => {
    setSelectedRole(role.toLowerCase());
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(identifier, password, selectedRole);
      if (res.success) {
        // Redirect logic based on role selection
        if (selectedRole === 'admin') {
          navigate('/admin'); // Admin lands on Overview
        } else {
          navigate('/'); // Students and Mentors land on their respective Home
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials or incorrect portal.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app px-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md w-full bg-card p-10 rounded-[3rem] border border-app shadow-2xl text-center"
          >
            <div className="inline-flex p-4 rounded-3xl bg-primary text-white mb-6 shadow-lg shadow-primary/20">
              <LogIn size={32} />
            </div>
            <h2 className="text-3xl font-bold dark:text-white text-slate-800 mb-2 tracking-tight uppercase">NCERT AI</h2>
            <p className="text-slate-500 mb-8 italic text-sm">Select your portal to continue</p>
            <div className="space-y-3">
              <RoleBtn icon={<User size={20}/>} label="Login as Student" onClick={() => handleRoleSelect('student')} />
              <RoleBtn icon={<Users size={20}/>} label="Login as Mentor" onClick={() => handleRoleSelect('mentor')} />
              <RoleBtn icon={<ShieldCheck size={20}/>} label="Login as Admin" onClick={() => handleRoleSelect('admin')} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="max-w-md w-full bg-card p-10 rounded-[3rem] border border-app shadow-2xl"
          >
            <button onClick={() => setStep(1)} className="mb-6 flex items-center gap-1 text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-widest transition-all">
              <ChevronLeft size={16} /> Back
            </button>
            <h2 className="text-3xl font-bold dark:text-white text-slate-800 mb-1 uppercase tracking-tight">Sign In</h2>
            <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-8">{selectedRole} workspace</p>
            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-2xl">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 ml-1">ID / Username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required onChange={(e) => setIdentifier(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl outline-none focus:border-primary dark:text-white font-bold" placeholder="Enter ID" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" required onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-black/20 border border-app rounded-2xl outline-none focus:border-primary dark:text-white font-bold" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">Initialize Session</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RoleBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 border border-app rounded-2xl hover:border-primary transition-all font-bold dark:text-white text-slate-700 group">
    <div className="text-slate-400 group-hover:text-primary transition-colors">{icon}</div> {label}
  </button>
);

export default Login;