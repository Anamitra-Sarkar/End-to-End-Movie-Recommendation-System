"use client";

import React from 'react'
import { Bell, Search, X, Menu, LogIn, Flame, Gift, Sparkles, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { useSmartNotify } from '@/context/SmartNotifyContext'

const Header = () => {
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showSearch, setShowSearch] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const notificationRef = React.useRef(null);
    const searchInputRef = React.useRef(null);
    const router = useRouter();
    const { toggleSidebar } = useSidebar();
    const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useSmartNotify();

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.action) {
            notification.action();
            setShowNotifications(false);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <Sparkles size={16} className="text-green-400" />;
            case 'milestone':
                return <Gift size={16} className="text-yellow-400" />;
            case 'warning':
                return <Flame size={16} className="text-orange-400" />;
            case 'info':
            default:
                return <Info size={16} className="text-blue-400" />;
        }
    };

    return (
        <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-50">
            {/* Mobile Hamburger Menu */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden p-3 bg-card/50 hover:bg-card rounded-full text-white backdrop-blur-sm transition-colors"
            >
                <Menu size={20} />
            </button>

            {/* Spacer for desktop */}
            <div className="hidden lg:block" />

            {/* Right side controls */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Search Bar (Expandable) */}
                {showSearch ? (
                    <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search movies..."
                                className="w-48 md:w-64 pl-4 pr-10 py-2.5 bg-card/90 border border-white/10 rounded-xl text-white placeholder-text-secondary backdrop-blur-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearchQuery('');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="p-2.5 bg-primary hover:bg-primary/90 rounded-xl text-white transition-colors"
                        >
                            <Search size={18} />
                        </button>
                    </form>
                ) : null}

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        className="p-3 bg-card/50 hover:bg-card rounded-full text-white backdrop-blur-sm transition-colors relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-background"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-semibold text-white">Notifications</h3>
                                {unreadCount > 0 && <span className="text-xs bg-primary px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-text-secondary">
                                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 flex gap-3 ${!notif.read ? 'bg-white/5' : ''}`}
                                        >
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-gray-400'}`}>{notif.text}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-text-secondary">{notif.time}</p>
                                                    {notif.actionLabel && (
                                                        <span className="text-xs text-primary font-medium">{notif.actionLabel} →</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dismissNotification(notif.id);
                                                }}
                                                className="text-text-secondary hover:text-white transition-colors p-1 opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-white/5 text-center">
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                                        disabled={unreadCount === 0}
                                    >
                                        Mark all as read
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Search Toggle Button */}
                {!showSearch && (
                    <button
                        onClick={() => setShowSearch(true)}
                        className="p-3 bg-card/50 hover:bg-card rounded-full text-white backdrop-blur-sm transition-colors"
                    >
                        <Search size={20} />
                    </button>
                )}
            </div>
        </header>
    )
}

export default Header
