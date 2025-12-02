export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  department?: string;
  year?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

const AUTH_STORAGE_KEY = 'research_auth';

export const authService = {
  login: (user: User): void => {
    const token = `fake_jwt_${user.id}_${Date.now()}`;
    const authState: AuthState = { user, token };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getAuthState: (): AuthState | null => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return authService.getAuthState() !== null;
  },

  hasRole: (role: UserRole): boolean => {
    const authState = authService.getAuthState();
    return authState?.user?.role === role;
  },

  hasAnyRole: (roles: UserRole[]): boolean => {
    const authState = authService.getAuthState();
    if (!authState?.user) return false;
    return roles.includes(authState.user.role);
  },

  authenticate: (email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem('system_users') || '[]');
    const allUsers = [...demoUsers, ...users];
    const user = allUsers.find((u) => u.email === email && u.password === password);
    return user || null;
  },

  register: (userData: Omit<User, 'id' | 'role'>): User => {
    const users = JSON.parse(localStorage.getItem('system_users') || '[]');
    const newUser: User = {
      id: `user_${Date.now()}`,
      ...userData,
      role: 'student',
    };
    users.push(newUser);
    localStorage.setItem('system_users', JSON.stringify(users));
    return newUser;
  },
};

// Demo users for easy login
export const demoUsers: User[] = [
  {
    id: 'student_1',
    email: 'student@university.edu',
    name: 'John Student',
    role: 'student',
    password: 'student123',
    department: 'Computer Science',
    year: '2024',
  },
  {
    id: 'faculty_1',
    email: 'faculty@university.edu',
    name: 'Dr. Jane Faculty',
    role: 'faculty',
    password: 'faculty123',
  },
  {
    id: 'admin_1',
    email: 'admin@university.edu',
    name: 'Admin User',
    role: 'admin',
    password: 'admin123',
  },
];
