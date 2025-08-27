import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/board';

interface UserContextType {
  users: User[];
  getUserById: (id: string) => User | null;
  getUserDisplayName: (id: string) => string;
  getUserInitials: (id: string) => string;
  loading: boolean;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// All application users including auth real-time users
const allUsers: User[] = [
  // Super Admin
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'testsuperadmin@example.com',
    username: 'superadmin',
    fullname: 'Super Administrator',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Department Users
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'sales@yourcompany.com',
    username: 'sales',
    fullname: 'Sales Department',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'purchase@yourcompany.com',
    username: 'purchase',
    fullname: 'Purchase Department',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'operations@yourcompany.com',
    username: 'operations',
    fullname: 'Operations Department',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'inventory@yourcompany.com',
    username: 'inventory',
    fullname: 'Inventory Department',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'accounts@yourcompany.com',
    username: 'accounts',
    fullname: 'Accounts Department',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    email: 'hr@yourcompany.com',
    username: 'hr',
    fullname: 'HR Department',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Additional Pakistani team members
  {
    id: '7744c17c-d74a-4d65-93d5-34d6bb8ffcad',
    email: 'ahmad.khan@techcorp.pk',
    username: 'ahmad.khan',
    fullname: 'Ahmad Khan',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    email: 'fatima.shah@innovate.pk',
    username: 'fatima.shah',
    fullname: 'Fatima Shah',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b2c3d4e5-f6g7-8901-2345-678901bcdefg',
    email: 'usman.ali@digitalpk.com',
    username: 'usman.ali',
    fullname: 'Usman Ali',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'c3d4e5f6-g7h8-9012-3456-789012cdefgh',
    email: 'zara.ahmed@solutions.pk',
    username: 'zara.ahmed',
    fullname: 'Zara Ahmed',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'd4e5f6g7-h8i9-0123-4567-890123defghi',
    email: 'hassan.malik@startuppk.com',
    username: 'hassan.malik',
    fullname: 'Hassan Malik',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Supabase MCP call when ready
      // For now, using complete user list including auth users
      await new Promise(resolve => setTimeout(resolve, 300));
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to mock data
      setUsers(allUsers);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      // TODO: Implement Supabase MCP user creation
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email || '',
        username: userData.username || '',
        fullname: userData.fullname || '',
        avatar_url: userData.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setUsers(prev => [...prev, newUser]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      // TODO: Implement Supabase MCP user update
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, ...updates, updated_at: new Date().toISOString() }
          : user
      ));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const getUserById = (id: string): User | null => {
    return users.find(user => user.id === id) || null;
  };

  const getUserDisplayName = (id: string): string => {
    const user = getUserById(id);
    if (!user) return 'Unknown User';
    return user.fullname || user.username || user.email;
  };

  const getUserInitials = (id: string): string => {
    const user = getUserById(id);
    if (!user) return 'UN';
    
    const name = user.fullname || user.username || user.email;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <UserContext.Provider value={{
      users,
      getUserById,
      getUserDisplayName,
      getUserInitials,
      loading,
      createUser,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
} 