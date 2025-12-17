import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithGoogle, logOut, onAuthChange } from '../firebase/authService';
import { userService } from '../api/userService';

// Generate avatar color from string
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#0891B2', '#BE185D'];
  return colors[Math.abs(hash) % colors.length];
}

// Convert Firebase user to AppUser
function firebaseUserToAppUser(user) {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    avatarColor: stringToColor(user.uid),
    isFirebaseUser: true,
  };
}

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
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

  // Google Sign-In
  const signInWithGoogleAccount = async () => {
    try {
      // Clear any mock user first
      localStorage.removeItem('mockUser');
      
      const firebaseUser = await signInWithGoogle();
      const appUser = firebaseUserToAppUser(firebaseUser);
      
      // Ensure user record exists in Firestore with initial balance
      await userService.getOrCreateUser(
        appUser.uid,
        appUser.email,
        appUser.displayName
      );
      
      setCurrentUser(appUser);
      return { success: true };
    } catch (error) {
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

