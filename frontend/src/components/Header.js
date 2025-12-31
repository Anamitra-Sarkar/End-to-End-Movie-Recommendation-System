"use client";

import React from 'react'
import { Bell, Search } from 'lucide-react'

const Header = () => {
    const [showNotifications, setShowNotifications] = React.useState(false);
    const notificationRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [notifications, setNotifications] = React.useState([
        { id: 1, text: "Inception added to your Watchlist", time: "2 min ago", type: "success", read: false },
        { id: 2, text: "New arrival: Dune Part Two", time: "1 hour ago", type: "info", read: false },
        { id: 3, text: "Your subscription renews tomorrow", time: "1 day ago", type: "warning", read: false }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="absolute top-0 right-0 p-6 flex items-center justify-end gap-4 z-40">
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

            <button className="p-3 bg-card/50 hover:bg-card rounded-full text-white backdrop-blur-sm transition-colors">
                <Search size={20} />
            </button>
        </header>
    )
}

export default Header
