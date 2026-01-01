"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="text-green-400" size={20} />;
            case 'error':
                return <AlertCircle className="text-red-400" size={20} />;
            case 'info':
                return <Info className="text-blue-400" size={20} />;
        }
    };

    const getBorderColor = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return 'border-green-500/30';
            case 'error':
                return 'border-red-500/30';
            case 'info':
                return 'border-blue-500/30';
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={`flex items-center gap-3 px-4 py-3 bg-card/95 backdrop-blur-xl border ${getBorderColor(notification.type)} rounded-xl shadow-2xl min-w-[280px] max-w-[400px]`}
                        >
                            {getIcon(notification.type)}
                            <span className="flex-1 text-sm text-white font-medium">
                                {notification.message}
                            </span>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-text-secondary hover:text-white transition-colors p-1"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification(): NotificationContextType {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
