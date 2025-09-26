"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useState } from 'react';

// Mock user object for self-hosted deployment
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  currentUser: MockUser | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  signUpWithEmail: (auth: any, email: string, pass: string, displayName?: string) => Promise<MockUser | null>;
  signInWithEmail: (auth: any, email: string, pass: string) => Promise<MockUser | null>;
  signInWithGoogle: () => Promise<MockUser | null>;
  sendPasswordReset: (auth: any, email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (user: MockUser, profileData: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(false); // Set to false for self-hosted
  const [error, setError] = useState<string | null>(null);

  // Mock functions - for self-hosted deployment, authentication is disabled
  const signUpWithEmail = async (auth: any, email: string, pass: string, displayName?: string): Promise<MockUser | null> => {
    console.log('Authentication disabled in self-hosted mode');
    return null;
  };

  const signInWithEmail = async (auth: any, email: string, pass: string): Promise<MockUser | null> => {
    console.log('Authentication disabled in self-hosted mode');
    return null;
  };
  
  const signInWithGoogle = async (): Promise<MockUser | null> => {
    console.log('Authentication disabled in self-hosted mode');
    return null;
  };
  
  const sendPasswordReset = async (auth: any, email: string): Promise<void> => {
    console.log('Authentication disabled in self-hosted mode');
  };

  const signOut = async () => {
    console.log('Authentication disabled in self-hosted mode');
    setCurrentUser(null);
  };

  const updateUserProfile = async (user: MockUser, profileData: { displayName?: string; photoURL?: string }): Promise<void> => {
    console.log('Authentication disabled in self-hosted mode');
  };

  const value = {
    currentUser,
    loading,
    error,
    setError,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}