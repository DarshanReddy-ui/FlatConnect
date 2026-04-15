import React from 'react';
import Dashboard from './Dashboard';

const AdminDashboard = ({ user }) => {
  return <Dashboard userRole="admin" user={user} />;
};

export default AdminDashboard;