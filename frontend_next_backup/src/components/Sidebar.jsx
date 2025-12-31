import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Home, Compass, Bookmark, Users,
    Film, Tv, MonitorPlay, Baby,
    LogOut
} from 'lucide-react'
import { cn } from '../lib/utils'

const SidebarItem = ({ icon: Icon, label, path, active }) => {
    return (
        <Link
            to={path}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                active
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-card-hover hover:text-white"
            )}
        >
            <Icon size={20} className={cn("transition-colors", active ? "text-primary" : "text-text-secondary group-hover:text-white")} />
            <span className="font-medium text-sm">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,163,255,0.8)]" />}
        </Link>
    )
}

const SidebarCategory = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="px-4 text-xs font-semibold text-text-secondary/50 uppercase tracking-wider mb-2">
            {title}
        </h3>
        <div className="space-y-1">
            {children}
        </div>
    </div>
)

const Sidebar = () => {
    const location = useLocation()
    const pathname = location.pathname

    return (
        <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-white/5 flex-shrink-0 z-50">
            {/* Logo */}
            <div className="p-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    CineStream
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
                <SidebarCategory title="Menu">
                    <SidebarItem icon={Home} label="Home" path="/" active={pathname === '/'} />
                    <SidebarItem icon={Compass} label="Browse" path="/browse" active={pathname === '/browse'} />
                    <SidebarItem icon={Bookmark} label="Watchlist" path="/watchlist" active={pathname === '/watchlist'} />
                    <SidebarItem icon={Users} label="Community" path="/community" active={pathname === '/community'} />
                </SidebarCategory>

                <SidebarCategory title="Categories">
                    <SidebarItem icon={Film} label="Movies" path="/movies" active={pathname === '/movies'} />
                    <SidebarItem icon={Tv} label="TV Shows" path="/tv-shows" active={pathname === '/tv-shows'} />
                    <SidebarItem icon={MonitorPlay} label="Anime" path="/anime" active={pathname === '/anime'} />
                    <SidebarItem icon={Baby} label="Kids & Family" path="/kids" active={pathname === '/kids'} />
                </SidebarCategory>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-card-hover cursor-pointer transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Alex Morgan</p>
                        <p className="text-xs text-text-secondary truncate">Premium Plan</p>
                    </div>
                    <LogOut size={16} className="text-text-secondary group-hover:text-red-400 transition-colors" />
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
