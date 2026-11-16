import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import MentorLayout from './components/layout/MentorLayout';
import AdminLayout from './components/layout/AdminLayout';

// Student & Shared Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import MentorStudents from './pages/MentorStudents';
import Experiments from './pages/Experiments';
import Simulations from './pages/Simulations'; 
import SimulationViewer from './pages/SimulationViewer';
import ChapterReader from './pages/ChapterReader';
import Bookmarks from './pages/Bookmarks';
import Subjects from './pages/Subjects';
import TopicDetail from './pages/TopicDetail';
import Progress from './pages/Progress';
import Updates from './pages/Updates';
import Notes from './pages/Notes';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSubjects from './pages/admin/ManageSubjects';
import ChapterCreator from './pages/admin/ChapterCreator';
import ManageSimulations from './pages/admin/ManageSimulations';
import ExperimentsManager from './pages/admin/ExperimentsManager';
import UserManager from './pages/admin/UserManager';
import Announcements from './pages/admin/Announcements';
import AdminProfile from './pages/admin/AdminProfile';

/**
 * StudentMentorRoute: 
 * Used for all student-view paths.
 * If user is Admin, it still shows StudentLayout (Student View mode).
 */
const StudentMentorRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center font-bold text-primary animate-pulse">
        RESTORING SESSION...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  // Decide layout based on role
  if (user.role === 'mentor') return <MentorLayout>{children}</MentorLayout>;
  return <StudentLayout>{children}</StudentLayout>;
};

/**
 * AdminRoute:
 * Used for all /admin/* paths.
 * Only allows users with role 'admin' to enter.
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-primary font-black uppercase tracking-widest animate-pulse text-[10px]">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  const { user, loading } = useAuth();

  // App Initialization Splash
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center font-black text-primary italic animate-pulse">
        NCERT AI INITIALIZING...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* PUBLIC ACCESS */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />} 
        />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
        
        {/* STUDENT VIEW ROUTES (Accessed by Students, Mentors, and Admins) */}
        <Route path="/" element={<StudentMentorRoute>{user?.role === 'mentor' ? <MentorDashboard /> : <Dashboard />}</StudentMentorRoute>} />
        <Route path="/profile" element={<StudentMentorRoute><Profile /></StudentMentorRoute>} />
        <Route path="/updates" element={<StudentMentorRoute><Updates /></StudentMentorRoute>} />
        <Route path="/bookmarks" element={<StudentMentorRoute><Bookmarks /></StudentMentorRoute>} />
        <Route path="/notes" element={<StudentMentorRoute><Notes /></StudentMentorRoute>} />
        <Route path="/progress" element={<StudentMentorRoute><Progress /></StudentMentorRoute>} />
        <Route path="/experiments" element={<StudentMentorRoute><Experiments /></StudentMentorRoute>} />
        <Route path="/simulations" element={<StudentMentorRoute><Simulations /></StudentMentorRoute>} />
        <Route path="/subjects" element={<StudentMentorRoute><Subjects /></StudentMentorRoute>} />
        <Route path="/subjects/:slug" element={<StudentMentorRoute><TopicDetail /></StudentMentorRoute>} />
        <Route path="/chapter/:id" element={<StudentMentorRoute><ChapterReader /></StudentMentorRoute>} />
        <Route path="/simulation/:id" element={<StudentMentorRoute><SimulationViewer /></StudentMentorRoute>} />
        <Route path="/mentor/students" element={<StudentMentorRoute><MentorStudents /></StudentMentorRoute>} />

        {/* ADMIN EXCLUSIVE MANAGEMENT ROUTES */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
        <Route path="/admin/subjects" element={<AdminRoute><ManageSubjects /></AdminRoute>} />
        <Route path="/admin/chapters" element={<AdminRoute><ChapterCreator /></AdminRoute>} />
        <Route path="/admin/simulations" element={<AdminRoute><ManageSimulations /></AdminRoute>} />
        <Route path="/admin/experiments" element={<AdminRoute><ExperimentsManager /></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><Announcements /></AdminRoute>} />
        <Route path="/admin/manage-users" element={<AdminRoute><UserManager role="all" /></AdminRoute>} />
        <Route path="/admin/manage-admins" element={<AdminRoute><UserManager role="Admin" /></AdminRoute>} />
        <Route path="/admin/manage-mentors" element={<AdminRoute><UserManager role="Mentor" /></AdminRoute>} />
        <Route path="/admin/manage-students" element={<AdminRoute><UserManager role="Student" /></AdminRoute>} />

        {/* 404 FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;