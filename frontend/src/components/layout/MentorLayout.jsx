import React from 'react';
import MentorSidebar from './MentorSidebar';

const MentorLayout = ({ children }) => (
  <div className="flex min-h-screen bg-app transition-colors duration-300">
    <MentorSidebar />
    <main className="flex-1 p-8 overflow-y-auto"><div className="max-w-6xl mx-auto">{children}</div></main>
  </div>
);
export default MentorLayout;