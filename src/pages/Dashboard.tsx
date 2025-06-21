
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Home from './Home';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <Home />;
};

export default Dashboard;
