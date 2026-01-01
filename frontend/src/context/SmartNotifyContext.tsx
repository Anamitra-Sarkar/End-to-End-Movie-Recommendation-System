"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Notification types for the bell icon
export interface SmartNotification {
    id: string;
    text: string;
    time: string;
    type: 'success' | 'info' | 'warning' | 'milestone';
    read: boolean;
    action?: () => void;
    actionLabel?: string;
}

interface SmartNotifyContextType {
    notifications: SmartNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<SmartNotification, 'id' | 'read' | 'time'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    dismissNotification: (id: string) => void;
    triggerWatchlistAdd: (movieTitle: string) => void;
    triggerWelcomeBack: (firstName: string) => void;
    checkMilestones: (watchlistCount: number) => void;
}

const SmartNotifyContext = createContext<SmartNotifyContextType | undefined>(undefined);

// localStorage keys for deduplication
const STORAGE_KEYS = {
    GUEST_PROMPT_SHOWN: 'smart_notify_guest_prompt',
    WELCOME_SHOWN_SESSION: 'smart_notify_welcome_session',
    MILESTONE_5_SHOWN: 'smart_notify_milestone_5',
    COMMUNITY_HINT_SHOWN: 'smart_notify_community_hint',
    NOTIFICATIONS: 'smart_notify_list',
};

// Time constants
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export function SmartNotifyProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<SmartNotification[]>([]);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Load notifications from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setNotifications(parsed);
            } catch (e) {
                console.error('Failed to parse saved notifications:', e);
            }
        }
    }, []);

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }, [notifications]);

    // Guest mode prompt - check on load if user is null
    useEffect(() => {
        if (typeof window === 'undefined' || isLoading) return;
        
        // Only show if user is not logged in
        if (!user) {
            const lastShown = localStorage.getItem(STORAGE_KEYS.GUEST_PROMPT_SHOWN);
            const now = Date.now();
            
            // Check if 24 hours have passed since last shown
            if (!lastShown || (now - parseInt(lastShown, 10)) > TWENTY_FOUR_HOURS) {
                // Don't show immediately on first load - wait a bit
                const timer = setTimeout(() => {
                    addNotification({
                        text: "Unlock full power! 🔓 Log in to sync your watchlist across devices.",
                        type: 'info',
                        action: () => router.push('/login'),
                        actionLabel: 'Sign In',
                    });
                    localStorage.setItem(STORAGE_KEYS.GUEST_PROMPT_SHOWN, now.toString());
                }, 3000); // Show after 3 seconds
                
                return () => clearTimeout(timer);
            }
        }
    }, [user, isLoading, router]);

    // Random community/discovery hint (low frequency)
    useEffect(() => {
        if (typeof window === 'undefined' || isLoading) return;
        
        const lastShown = localStorage.getItem(STORAGE_KEYS.COMMUNITY_HINT_SHOWN);
        const now = Date.now();
        
        // Show once per 48 hours and only with 20% probability
        if ((!lastShown || (now - parseInt(lastShown, 10)) > TWENTY_FOUR_HOURS * 2) && Math.random() < 0.2) {
            const timer = setTimeout(() => {
                addNotification({
                    text: "Trending Alert: See what the community is raving about today! 🔥",
                    type: 'info',
                    action: () => router.push('/community'),
                    actionLabel: 'Explore',
                });
                localStorage.setItem(STORAGE_KEYS.COMMUNITY_HINT_SHOWN, now.toString());
            }, 10000); // Show after 10 seconds
            
            return () => clearTimeout(timer);
        }
    }, [isLoading, router]);

    const generateId = () => Math.random().toString(36).substring(2, 11);

    const getTimeAgo = () => 'Just now';

    const addNotification = useCallback((notification: Omit<SmartNotification, 'id' | 'read' | 'time'>) => {
        const newNotification: SmartNotification = {
            ...notification,
            id: generateId(),
            read: false,
            time: getTimeAgo(),
        };

        setNotifications(prev => {
            // Prevent duplicates by checking text
            if (prev.some(n => n.text === notification.text && !n.read)) {
                return prev;
            }
            // Keep max 10 notifications
            const updated = [newNotification, ...prev].slice(0, 10);
            return updated;
        });
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Trigger: User adds movie to watchlist
    const triggerWatchlistAdd = useCallback((movieTitle: string) => {
        addNotification({
            text: `Great taste! '${movieTitle}' added. 🎬 (Watch option coming soon!)`,
            type: 'success',
        });
    }, [addNotification]);

    // Trigger: User logs in successfully
    const triggerWelcomeBack = useCallback((firstName: string) => {
        if (typeof window === 'undefined') return;
        
        // Only show once per session
        const sessionId = sessionStorage.getItem('session_id') || generateId();
        sessionStorage.setItem('session_id', sessionId);
        
        const welcomeKey = `${STORAGE_KEYS.WELCOME_SHOWN_SESSION}_${sessionId}`;
        if (sessionStorage.getItem(welcomeKey)) return;
        
        sessionStorage.setItem(welcomeKey, 'true');
        
        addNotification({
            text: `Welcome back, ${firstName}! 🍿 Ready to find your next favorite movie?`,
            type: 'success',
        });
    }, [addNotification]);

    // Trigger: Check for milestone achievements
    const checkMilestones = useCallback((watchlistCount: number) => {
        if (typeof window === 'undefined') return;
        
        // Milestone: 5 movies in watchlist
        if (watchlistCount >= 5 && !localStorage.getItem(STORAGE_KEYS.MILESTONE_5_SHOWN)) {
            localStorage.setItem(STORAGE_KEYS.MILESTONE_5_SHOWN, 'true');
            addNotification({
                text: "You're a certified movie buff! 🌟 That's 5 movies in your collection.",
                type: 'milestone',
            });
        }
    }, [addNotification]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <SmartNotifyContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                dismissNotification,
                triggerWatchlistAdd,
                triggerWelcomeBack,
                checkMilestones,
            }}
        >
            {children}
        </SmartNotifyContext.Provider>
    );
}

export function useSmartNotify(): SmartNotifyContextType {
    const context = useContext(SmartNotifyContext);
    if (context === undefined) {
        throw new Error('useSmartNotify must be used within a SmartNotifyProvider');
    }
    return context;
}
