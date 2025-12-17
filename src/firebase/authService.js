import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

// Restrict to columbia.edu domain
googleProvider.setCustomParameters({
  hd: 'columbia.edu'
});

/**
 * Sign in with Google (Columbia accounts only)
 * @returns {Promise<import('firebase/auth').User>}
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Double-check email domain for security
    if (!result.user.email?.endsWith('@columbia.edu')) {
      await signOut(auth);
      throw new Error('Please use your Columbia email (@columbia.edu)');
    }
    
    return result.user;
  } catch (error) {
    // Handle specific errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function logOut() {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 * @returns {import('firebase/auth').User | null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

