import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { signInWithGoogle, logOut, onAuthChange } from '../firebase/authService';
import type { User as FirebaseUser } from 'firebase/auth';

// Unified user interface for both mock and Firebase users
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  avatarColor: string;
  isFirebaseUser: boolean;
}

// Mock users for demo/testing
export const MOCK_USERS = [
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
];

// Generate avatar color from string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2', '#BE185D'];
  return colors[Math.abs(hash) % colors.length];
}

// Convert Firebase user to AppUser
function firebaseUserToAppUser(user: FirebaseUser): AppUser {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
    avatarColor: stringToColor(user.uid),
    isFirebaseUser: true,
  };
}

interface UserContextType {
  currentUser: AppUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  // Mock auth
  authenticateWithMock: (email: string, password: string) => { success: boolean; error?: string };
  // Google auth
  signInWithGoogleAccount: () => Promise<{ success: boolean; error?: string }>;
  // Logout
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    // First check localStorage for mock user
    const savedMockUser = localStorage.getItem('mockUser');
    if (savedMockUser) {
      try {
        setCurrentUser(JSON.parse(savedMockUser));
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem('mockUser');
      }
    }

    // Listen for Firebase auth changes
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUserToAppUser(firebaseUser));
      } else {
        // Check if there's still a mock user
        const mockUser = localStorage.getItem('mockUser');
        if (mockUser) {
          try {
            setCurrentUser(JSON.parse(mockUser));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Mock authentication
  const authenticateWithMock = (email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
    
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    
    const appUser: AppUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      avatarColor: user.avatarColor,
      isFirebaseUser: false,
    };
    
    setCurrentUser(appUser);
    localStorage.setItem('mockUser', JSON.stringify(appUser));
    return { success: true };
  };

  // Google Sign-In
  const signInWithGoogleAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Clear any mock user first
      localStorage.removeItem('mockUser');
      
      const firebaseUser = await signInWithGoogle();
      setCurrentUser(firebaseUserToAppUser(firebaseUser));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to sign in with Google.' };
    }
  };

  // Logout
  const logout = async () => {
    // Clear mock user
    localStorage.removeItem('mockUser');
    
    // Sign out from Firebase if it's a Firebase user
    if (currentUser?.isFirebaseUser) {
      await logOut();
    }
    
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoggedIn: currentUser !== null,
        isLoading,
        authenticateWithMock,
        signInWithGoogleAccount,
        logout,
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
