import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen bg-app transition-colors duration-300">
    <AdminSidebar />
    <main className="flex-1 p-8 overflow-y-auto"><div className="max-w-6xl mx-auto">{children}</div></main>
  </div>
);
export default AdminLayout;