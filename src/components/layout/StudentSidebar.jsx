import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  User, Bell, Bookmark, FileText, BarChart3, FlaskConical, 
  Layers, PlayCircle, LogOut, Home, Sun, Moon, ShieldCheck 
} from 'lucide-react';

const StudentSidebar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <Bell size={20} />, label: 'Updates', path: '/updates' },
    { icon: <Bookmark size={20} />, label: 'Bookmarks', path: '/bookmarks' },
    { icon: <FileText size={20} />, label: 'Notes', path: '/notes' },
    { icon: <BarChart3 size={20} />, label: 'Progress', path: '/progress' },
    { icon: <FlaskConical size={20} />, label: 'Experiments', path: '/experiments' },
    { icon: <PlayCircle size={20} />, label: 'Simulations', path: '/simulations' },
    { icon: <Layers size={20} />, label: 'Subjects', path: '/subjects' },
  ];

  return (
    <div className="w-64 h-screen flex flex-col sticky top-0 z-40 bg-sidebar border-r border-app transition-colors duration-300 shadow-sm">
      
      {/* Header Profile Link */}
      <Link to="/profile" className="p-6 border-b border-app text-center block hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
        <div className="w-16 h-16 bg-primary-glow rounded-full mx-auto mb-3 flex items-center justify-center text-primary">
          <User size={32} />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">
          {user?.role === 'admin' ? 'Administrator' : user?.role === 'mentor' ? 'Mentor' : 'Student'}
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          {user?.role === 'admin' ? 'Student View mode' : 'Class 12 • Science'}
        </p>
      </Link>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={idx} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/50 hover:text-primary'
              }`}
            >
              {item.icon} <span>{item.label}</span>
            </Link>
          );
        })}

        {/* RETURN TO ADMIN PANEL (Only if user is admin) */}
        {user?.role === 'admin' && (
          <div className="mt-4 pt-4 border-t border-app">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform">
              <ShieldCheck size={20} />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-app space-y-2 bg-sidebar">
        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
          {isDarkMode ? <Sun size={18} className="text-orange-400" /> : <Moon size={18} className="text-blue-600" />}
          <span>{isDarkMode ? 'Light UI' : 'Dark UI'}</span>
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-sm transition-all">
          <LogOut size={20} /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;