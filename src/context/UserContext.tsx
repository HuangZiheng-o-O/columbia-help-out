import { createContext, useContext, useState, type ReactNode } from 'react';

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  avatarColor: string;
  password: string; // Mock password for authentication
}

// Mock users for testing different user interactions
// Credentials for testing:
// - jordan@columbia.edu / jordan123
// - li.andy@columbia.edu / andy123
// - sarah.kim@columbia.edu / sarah123
// - pat.singh@columbia.edu / pat123
// - alex.taylor@columbia.edu / alex123
export const MOCK_USERS: MockUser[] = [
  {
    uid: 'mock-user-1',
    email: 'jordan@columbia.edu',
    displayName: 'Jordan Lee',
    avatarColor: '#4F46E5',
    password: 'jordan123',
  },
  {
    uid: 'mock-user-2',
    email: 'li.andy@columbia.edu',
    displayName: 'Andy Li',
    avatarColor: '#059669',
    password: 'andy123',
  },
  {
    uid: 'mock-user-3',
    email: 'sarah.kim@columbia.edu',
    displayName: 'Sarah Kim',
    avatarColor: '#DC2626',
    password: 'sarah123',
  },
  {
    uid: 'mock-user-4',
    email: 'pat.singh@columbia.edu',
    displayName: 'Pat Singh',
    avatarColor: '#D97706',
    password: 'pat123',
  },
  {
    uid: 'mock-user-5',
    email: 'alex.taylor@columbia.edu',
    displayName: 'Alex Taylor',
    avatarColor: '#7C3AED',
    password: 'alex123',
  },
];

interface UserContextType {
  currentUser: MockUser | null;
  login: (user: MockUser) => void;
  authenticate: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(() => {
    // Try to restore user from localStorage
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = (user: MockUser) => {
    setCurrentUser(user);
    // Don't store password in localStorage
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
  };

  const authenticate = (email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
    
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    
    login(user);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        login,
        authenticate,
        logout,
        isLoggedIn: currentUser !== null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

