"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isConfigured: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined' || !auth || !isFirebaseConfigured) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth || !isFirebaseConfigured) {
            throw new Error('Firebase is not configured. Please add your Firebase credentials to the .env file.');
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!auth || !isFirebaseConfigured) {
            throw new Error('Firebase is not configured. Please add your Firebase credentials to the .env file.');
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Email sign-in error:', error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        if (!auth || !isFirebaseConfigured) {
            throw new Error('Firebase is not configured. Please add your Firebase credentials to the .env file.');
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Email sign-up error:', error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth || !isFirebaseConfigured) {
            throw new Error('Firebase is not configured');
        }
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isConfigured: isFirebaseConfigured,
                signInWithGoogle,
                signInWithEmail,
                signUpWithEmail,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
