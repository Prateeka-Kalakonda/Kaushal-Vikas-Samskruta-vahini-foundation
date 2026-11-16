import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', 
    age: '', class_level: '12', mobile: '', 
    role: 'student' // Hardcoded role
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(formData);
      if (res.success) {
        alert("Registration Successful! Please Sign In.");
        navigate('/login');
      }
    } catch (err) {
      alert("Registration failed. Please check your data.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app px-4 py-10">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-card p-10 rounded-[3rem] border border-app shadow-2xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Create Student Account</h2>
          <p className="text-slate-500 mt-1 italic">Start your AI-powered NCERT journey</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" required className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl outline-none focus:border-primary transition-all text-slate-900 dark:text-white font-bold" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl outline-none focus:border-primary transition-all text-slate-900 dark:text-white font-bold" placeholder="name@email.com" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" required className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl outline-none focus:border-primary transition-all text-slate-900 dark:text-white font-bold" placeholder="••••••••" onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Age</label>
                <input type="number" required className="w-full mt-1 p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl outline-none text-slate-900 dark:text-white font-bold" placeholder="17" onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Class</label>
                <select className="w-full mt-1 p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl outline-none text-slate-900 dark:text-white font-bold" onChange={e => setFormData({...formData, class_level: e.target.value})}>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Mobile Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-[#1a1a1a] border border-app rounded-2xl outline-none text-slate-900 dark:text-white font-bold" placeholder="+91 ..." onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
            </div>

            <div className="pt-2">
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">By initializing, you agree to the NCERT AI research terms and secure data policies.</p>
            </div>
          </div>

          <button type="submit" className="md:col-span-2 w-full py-5 rounded-2xl mt-4 bg-primary text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all active:scale-95">
            Initialize Session
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          Registered Researcher? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;