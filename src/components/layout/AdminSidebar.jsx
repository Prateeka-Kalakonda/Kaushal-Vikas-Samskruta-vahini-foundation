import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, Book, Layers, FlaskConical, Users, 
  UserCheck, GraduationCap, Contact2, LogOut, ChevronLeft,
  Sun, Moon, MonitorPlay, Megaphone, UserCircle 
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin' },
    { icon: <Book size={20} />, label: 'Subjects', path: '/admin/subjects' },
    { icon: <Layers size={20} />, label: 'Chapters', path: '/admin/chapters' },
    { icon: <MonitorPlay size={20} />, label: 'Simulations', path: '/admin/simulations' },
    { icon: <FlaskConical size={20} />, label: 'Experiments', path: '/admin/experiments' },
    { icon: <Megaphone size={20} />, label: 'Announcements', path: '/admin/announcements' },
    { icon: <Contact2 size={20} />, label: 'Manage Users', path: '/admin/manage-users' },
    { icon: <UserCheck size={20} />, label: 'Manage Admins', path: '/admin/manage-admins' },
    { icon: <Users size={20} />, label: 'Manage Mentors', path: '/admin/manage-mentors' },
    { icon: <GraduationCap size={20} />, label: 'Manage Students', path: '/admin/manage-students' },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-app flex flex-col sticky top-0 z-40 transition-all duration-300">
      {/* Admin Profile Link */}
      <Link 
        to="/admin/profile" 
        className={`p-8 border-b border-app text-center block transition-all hover:bg-slate-50 dark:hover:bg-zinc-900/50 ${location.pathname === '/admin/profile' ? 'bg-slate-50 dark:bg-zinc-900/50' : ''}`}
      >
        <div className="w-16 h-16 bg-primary-glow rounded-full mx-auto mb-3 flex items-center justify-center text-primary border-2 border-primary/20">
          <UserCircle size={40} />
        </div>
        <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-tight">Administrator</h2>
        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Management Hub</p>
      </Link>
      
      {/* Scrollable Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, idx) => (
          <Link key={idx} to={item.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${location.pathname === item.path ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/50 hover:text-primary'}`}>
            {item.icon} <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-app space-y-2 bg-sidebar">
        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
          {isDarkMode ? <Sun size={18} className="text-orange-400" /> : <Moon size={18} className="text-blue-600" />}
          <span>{isDarkMode ? 'Light UI' : 'Dark UI'}</span>
        </button>

        {/* SWITCH TO STUDENT VIEW LINK */}
        <Link to="/" className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors bg-slate-50 dark:bg-zinc-900 rounded-xl shadow-sm">
          <ChevronLeft size={16} /> Student View
        </Link>

        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-sm transition-all">
          <LogOut size={20} /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;