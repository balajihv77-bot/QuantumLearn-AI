import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, UserProfile } from '../services/apiClient';
import { DEMO_USER_PROFILE } from '../data/demoData';
import { auth, googleProvider, signInWithPopup, signOut, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  login: (usernameOrEmail: string, pass: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; full_name?: string; institution?: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_FALLBACK_USER: UserProfile = {
  id: 1,
  email: DEMO_USER_PROFILE.email,
  username: 'alex_rivera',
  full_name: DEMO_USER_PROFILE.name,
  institution: DEMO_USER_PROFILE.institution,
  role: DEMO_USER_PROFILE.role,
  xp: DEMO_USER_PROFILE.xpPoints,
  level: DEMO_USER_PROFILE.level,
  streak_days: DEMO_USER_PROFILE.streakDays,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check if token exists
    const token = apiClient.getToken();
    const cached = apiClient.getCachedUser();
    if (token && cached) return cached;
    // Default initial session is demo user Alex Rivera unless explicitly logged out
    const isLoggedOut = localStorage.getItem('quantumlearn_logged_out') === 'true';
    if (!isLoggedOut) {
      return cached || DEMO_FALLBACK_USER;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        localStorage.removeItem('quantumlearn_logged_out');
        const userProfile: UserProfile = {
          id: Math.abs(fbUser.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
          email: fbUser.email || 'student@quantumlearn.edu',
          username: fbUser.displayName ? fbUser.displayName.toLowerCase().replace(/\s+/g, '_') : 'quantum_student',
          full_name: fbUser.displayName || 'Quantum Scholar',
          institution: 'Quantum Computing Student',
          role: 'Student',
          xp: 150,
          level: 1,
          streak_days: 1
        };
        setUser(userProfile);
        apiClient.setCachedUser(userProfile);
        apiClient.setToken(`fb_${fbUser.uid}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userProfile: UserProfile = {
        id: Math.abs(fbUser.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
        email: fbUser.email || 'student@quantumlearn.edu',
        username: fbUser.displayName ? fbUser.displayName.toLowerCase().replace(/\s+/g, '_') : 'quantum_student',
        full_name: fbUser.displayName || 'Quantum Scholar',
        institution: 'Quantum Computing Student',
        role: 'Student',
        xp: 150,
        level: 1,
        streak_days: 1
      };

      setUser(userProfile);
      apiClient.setCachedUser(userProfile);
      apiClient.setToken(`fb_${fbUser.uid}`);
      localStorage.removeItem('quantumlearn_logged_out');

      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Quantum Scholar',
          institution: 'Quantum Computing Student',
          role: 'Student',
          xp: 150,
          level: 1,
          streakDays: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (usernameOrEmail: string, pass: string) => {
    setIsLoading(true);
    try {
      await apiClient.login(usernameOrEmail, pass);
      localStorage.removeItem('quantumlearn_logged_out');
      try {
        const profile = await apiClient.getCurrentUser();
        setUser(profile);
        apiClient.setCachedUser(profile);
      } catch {
        const fallback: UserProfile = {
          ...DEMO_FALLBACK_USER,
          email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@quantumlearn.edu`,
          username: usernameOrEmail.split('@')[0],
          full_name: usernameOrEmail.split('@')[0],
        };
        setUser(fallback);
        apiClient.setCachedUser(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; username: string; password: string; full_name?: string; institution?: string }) => {
    setIsLoading(true);
    try {
      await apiClient.register(data);
      localStorage.removeItem('quantumlearn_logged_out');
      try {
        const profile = await apiClient.getCurrentUser();
        setUser(profile);
        apiClient.setCachedUser(profile);
      } catch {
        const fallback: UserProfile = {
          id: Date.now(),
          email: data.email,
          username: data.username,
          full_name: data.full_name || data.username,
          institution: data.institution || 'Quantum Computing Student',
          role: 'Student',
          xp: 100,
          level: 1,
          streak_days: 1
        };
        setUser(fallback);
        apiClient.setCachedUser(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    apiClient.clearToken();
    localStorage.setItem('quantumlearn_logged_out', 'true');
    setUser(null);
    setFirebaseUser(null);
  };

  const loginAsDemo = () => {
    localStorage.removeItem('quantumlearn_logged_out');
    apiClient.setToken('demo_token_alex_rivera_2026');
    setUser(DEMO_FALLBACK_USER);
    apiClient.setCachedUser(DEMO_FALLBACK_USER);
  };

  const isAuthenticated = user !== null || firebaseUser !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated,
        isLoading,
        logout,
        login,
        register,
        loginWithGoogle,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
