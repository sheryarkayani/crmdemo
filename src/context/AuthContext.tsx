import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthState | undefined>(undefined);

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured()) {
        // Demo mode - use mock super admin user
        console.warn('Supabase not configured, using demo auth');
        const mockUser: User = {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'testsuperadmin@example.com',
          username: 'superadmin',
          fullname: 'Super Administrator',
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(mockUser);
        return;
      }

      // Initialize Supabase Auth
      const { supabase } = await import('@/lib/supabase');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Fall back to demo mode
      const mockUser: User = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'testsuperadmin@example.com',
        username: 'superadmin',
        fullname: 'Super Administrator',
        role: 'superadmin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      const { supabase } = await import('@/lib/supabase');
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('User profile query result:', { profile, error });

      if (error) {
        console.error('Error fetching user profile:', error);
        // Don't throw here, just log and continue
        return;
      }

      if (profile) {
        console.log('Setting user profile:', profile);
        setUser(profile as User);
      } else {
        console.warn('No profile found for user ID:', userId);
      }
    } catch (error) {
      console.error('Exception in fetchUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Demo mode - simulate login based on email
      const demoUsers: Record<string, User> = {
        'testsuperadmin@example.com': {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'testsuperadmin@example.com',
          username: 'superadmin',
          fullname: 'Super Administrator',
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        'sales@yourcompany.com': {
          id: '22222222-2222-2222-2222-222222222222',
          email: 'sales@yourcompany.com',
          username: 'sales',
          fullname: 'Sales Department',
          role: 'sales',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        'purchase@yourcompany.com': {
          id: '33333333-3333-3333-3333-333333333333',
          email: 'purchase@yourcompany.com',
          username: 'purchase',
          fullname: 'Purchase Department',
          role: 'purchase',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        'operations@yourcompany.com': {
          id: '44444444-4444-4444-4444-444444444444',
          email: 'operations@yourcompany.com',
          username: 'operations',
          fullname: 'Operations Department',
          role: 'operations',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        'inventory@yourcompany.com': {
          id: '55555555-5555-5555-5555-555555555555',
          email: 'inventory@yourcompany.com',
          username: 'inventory',
          fullname: 'Inventory Department',
          role: 'inventory',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        'accounts@yourcompany.com': {
          id: '66666666-6666-6666-6666-666666666666',
          email: 'accounts@yourcompany.com',
          username: 'accounts',
          fullname: 'Accounts Department',
          role: 'accounts',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        'hr@yourcompany.com': {
          id: '77777777-7777-7777-7777-777777777777',
          email: 'hr@yourcompany.com',
          username: 'hr',
          fullname: 'HR Department',
          role: 'hr',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };

      const demoUser = demoUsers[email];
      if (demoUser) {
        setUser(demoUser);
        toast({
          title: "Demo Login Successful",
          description: `Logged in as ${demoUser.fullname}`,
        });
        return;
      } else {
        throw new Error('Invalid credentials');
      }
    }

    try {
      console.log('Attempting Supabase sign in for:', email);
      const { supabase } = await import('@/lib/supabase');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase auth response:', { data, error });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (data.user) {
        console.log('User authenticated, fetching profile for:', data.user.id);
        await fetchUserProfile(data.user.id);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      console.error('Sign in error details:', {
        message: error.message,
        status: error.status,
        statusCode: error.status_code,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide more specific error messages
      let errorMessage = "Invalid email or password";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please confirm your email address before signing in.";
      } else if (error.message?.includes('Database error')) {
        errorMessage = "Database connection error. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Role-based access control functions
  const canEdit = (boardOwnerRole: UserRole): boolean => {
    if (!user) return false;
    // Only superadmin should have universal edit access
    // Board-specific permissions should be handled by BoardContext.canEditCurrentBoard()
    return user.role === 'superadmin';
  };

  const canView = (): boolean => {
    return !!user; // All authenticated users can view
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      canEdit,
      canView
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 