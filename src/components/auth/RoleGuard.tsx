import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback }) => {
  const { user } = useAuth();

  if (!user) {
    return null; // PrivateRoute should handle this
  }

  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <Card className="apple-card max-w-md w-full border-0 shadow-apple-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-200/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Access Restricted
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-2">
              You don't have permission to access this resource.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Your Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Required Roles:</strong> {allowedRoles.map(role => 
                  role.charAt(0).toUpperCase() + role.slice(1)
                ).join(', ')}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard; 