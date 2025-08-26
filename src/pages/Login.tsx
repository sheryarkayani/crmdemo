import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  // If user is already authenticated, redirect them
  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 gradient-apple-blue rounded-2xl flex items-center justify-center mx-auto mb-4 animate-gentle-float">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
};

export default Login; 