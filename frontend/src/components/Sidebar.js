"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home, Compass, Bookmark, Users,
    Film, Tv, MonitorPlay, Baby,
    LogOut, Play, LogIn
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/context/UserContext'

const SidebarItem = ({ icon: Icon, label, path, active }) => {
    return (
        <Link
            href={path}
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
    const pathname = usePathname()
    const { user, logout } = useUser()

    return (
        <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-white/5 flex-shrink-0 z-50">
            {/* Logo */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                        <Play size={20} className="text-white fill-white ml-1" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white leading-none group-hover:text-primary transition-colors">
                            CINE<span className="text-primary group-hover:text-white transition-colors">PREDICT</span>
                        </h1>
                        <p className="text-[10px] font-bold text-text-secondary tracking-[0.2em] uppercase mt-0.5 ml-0.5">Premium</p>
                    </div>
                </Link>
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
                    <SidebarItem icon={MonitorPlay} label="Anime" path="/anime" active={pathname === '/anime'} />
                    <SidebarItem icon={Baby} label="Kids & Family" path="/kids" active={pathname === '/kids'} />
                </SidebarCategory>
            </div>

            {/* User Profile / Sign In */}
            <div className="p-4 border-t border-white/5">
                {user ? (
                    <div className="flex items-center gap-2">
                        <Link href="/profile" className="flex-1 flex items-center gap-3 p-2 rounded-xl hover:bg-card-hover cursor-pointer transition-colors group min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px] flex-shrink-0">
                                <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center overflow-hidden">
                                    <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-text-secondary truncate">{user?.plan || "Free Plan"}</p>
                            </div>
                        </Link>
                        <button
                            onClick={logout}
                            className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <Link href="/login" className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all">
                        <LogIn size={20} />
                        Sign In
                    </Link>
                )}
            </div>
        </aside>
    )
}

export default Sidebar
