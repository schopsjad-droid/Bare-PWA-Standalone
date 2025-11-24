import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireUsername?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireUsername = true 
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    // Check if authentication is required
    if (requireAuth && !user) {
      setLocation('/login');
      return;
    }

    // Check if username is required and missing
    if (requireUsername && user && userProfile) {
      const hasUsername = userProfile.username && 
                         userProfile.username !== 'مستخدم' && 
                         userProfile.username.trim() !== '';
      
      if (!hasUsername) {
        setLocation('/complete-profile');
        return;
      }
    }
  }, [user, userProfile, loading, requireAuth, requireUsername, setLocation]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (requireAuth && !user) {
    return null;
  }

  if (requireUsername && user && userProfile) {
    const hasUsername = userProfile.username && 
                       userProfile.username !== 'مستخدم' && 
                       userProfile.username.trim() !== '';
    
    if (!hasUsername) {
      return null;
    }
  }

  return <>{children}</>;
}

