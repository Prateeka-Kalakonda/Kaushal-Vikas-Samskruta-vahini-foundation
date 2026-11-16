import React from 'react';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children }) => (
  <div className="flex min-h-screen bg-app transition-colors duration-300">
    <StudentSidebar />
    <main className="flex-1 p-8 overflow-y-auto"><div className="max-w-6xl mx-auto">{children}</div></main>
  </div>
);
export default StudentLayout;