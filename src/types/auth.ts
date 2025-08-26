export type UserRole = 'superadmin' | 'sales' | 'purchase' | 'operations' | 'inventory' | 'accounts' | 'hr' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  fullname?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  canEdit: (boardOwnerRole: UserRole) => boolean;
  canView: () => boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
} 