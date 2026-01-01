"use client";

import React from 'react'
import { Bell, Search, X, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'

const Header = () => {
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showSearch, setShowSearch] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const notificationRef = React.useRef(null);
    const searchInputRef = React.useRef(null);
    const router = useRouter();
    const { toggleSidebar } = useSidebar();

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

    const [notifications, setNotifications] = React.useState([
        { id: 1, text: "Inception added to your Watchlist", time: "2 min ago", type: "success", read: false },
        { id: 2, text: "New arrival: Dune Part Two", time: "1 hour ago", type: "info", read: false },
        { id: 3, text: "Your subscription renews tomorrow", time: "1 day ago", type: "warning", read: false }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

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
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-semibold text-white">Notifications</h3>
                                {unreadCount > 0 && <span className="text-xs bg-primary px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className={`p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 flex gap-3 ${!notif.read ? 'bg-white/5' : ''}`}>
                                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-primary' : 'bg-gray-500'}`} />
                                        <div>
                                            <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-gray-400'}`}>{notif.text}</p>
                                            <p className="text-xs text-text-secondary mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-white/5 text-center">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                                    disabled={unreadCount === 0}
                                >
                                    Mark all as read
                                </button>
                            </div>
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
