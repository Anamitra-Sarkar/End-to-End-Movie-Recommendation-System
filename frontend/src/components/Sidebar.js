"use client";

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Home, Compass, Bookmark, Users,
    Film, MonitorPlay, Baby,
    LogOut, Play, LogIn, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { useSidebar } from '@/context/SidebarContext'

const SidebarItem = ({ icon: Icon, label, path, active, onNavigate, isCollapsed }) => {
    return (
        <Link
            href={path}
            onClick={onNavigate}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                active
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-card-hover hover:text-white"
            )}
            title={isCollapsed ? label : undefined}
        >
            <Icon size={20} className={cn("transition-colors", active ? "text-primary" : "text-text-secondary group-hover:text-white")} />
            {!isCollapsed && (
                <>
                    <span className="font-medium text-sm">{label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,163,255,0.8)]" />}
                </>
            )}
        </Link>
    )
}

const SidebarCategory = ({ title, children, isCollapsed }) => (
    <div className="mb-6">
        {!isCollapsed && (
            <h3 className="px-4 text-xs font-semibold text-text-secondary/50 uppercase tracking-wider mb-2">
                {title}
            </h3>
        )}
        <div className="space-y-1">
            {children}
        </div>
    </div>
)

const Sidebar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout, isLoading } = useAuth()
    const { showNotification } = useNotification()
    const { isOpen, closeSidebar, isCollapsed, toggleCollapsed } = useSidebar()

    const handleLogout = async () => {
        try {
            await logout()
            showNotification('Logged out successfully', 'info')
            closeSidebar()
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
            showNotification('Logout failed', 'error')
        }
    }

    // Close sidebar on navigation (for mobile)
    const handleNavigate = () => {
        closeSidebar()
    }

    // Get display name and avatar from Firebase user
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
    const photoURL = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static h-screen bg-sidebar flex flex-col border-r border-white/5 flex-shrink-0 z-50 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo & Mobile Close Button */}
                <div className="p-6 flex items-center justify-between">
                    {isCollapsed ? (
                        <div className="w-full flex justify-center">
                            <Link href="/" onClick={handleNavigate} className="group">
                                <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                                    <Play size={20} className="text-white fill-white ml-1" />
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link href="/" onClick={handleNavigate} className="flex items-center gap-3 group">
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
                            
                            {/* Close button for mobile */}
                            <button
                                onClick={closeSidebar}
                                className="lg:hidden p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Desktop collapse/expand toggle */}
                <button
                    onClick={toggleCollapsed}
                    className="hidden lg:block absolute -right-3 top-24 p-1.5 bg-card border border-white/10 rounded-full text-text-secondary hover:text-white hover:bg-primary transition-all z-10"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                <div className="flex-1 overflow-y-auto px-2 py-4 pb-20 custom-scrollbar">
                    <SidebarCategory title="Menu" isCollapsed={isCollapsed}>
                        <SidebarItem icon={Home} label="Home" path="/" active={pathname === '/'} onNavigate={handleNavigate} isCollapsed={isCollapsed} />
                        <SidebarItem icon={Compass} label="Browse" path="/browse" active={pathname === '/browse'} onNavigate={handleNavigate} isCollapsed={isCollapsed} />
                        <SidebarItem icon={Bookmark} label="Watchlist" path="/watchlist" active={pathname === '/watchlist'} onNavigate={handleNavigate} isCollapsed={isCollapsed} />
                        <SidebarItem icon={Users} label="Community" path="/community" active={pathname === '/community'} onNavigate={handleNavigate} isCollapsed={isCollapsed} />
                    </SidebarCategory>

                    <SidebarCategory title="Categories" isCollapsed={isCollapsed}>
                        <SidebarItem icon={Film} label="Movies" path="/movies" active={pathname === '/movies'} onNavigate={handleNavigate} isCollapsed={isCollapsed} />
                        <SidebarItem icon={MonitorPlay} label="Anime" path="/anime" active={pathname === '/anime'} onNavigate={handleNavigate} isCollapsed={isCollapsed} />
                        <SidebarItem icon={Baby} label="Kids & Family" path="/kids" active={pathname === '/kids'} onNavigate={handleNavigate} isCollapsed={isCollapsed} />
                    </SidebarCategory>
                </div>

                {/* User Profile / Sign In */}
                <div className="p-4 border-t border-white/5">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-3">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : user ? (
                        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
                            {isCollapsed ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Link href="/profile" onClick={handleNavigate} className="group" title={displayName}>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center overflow-hidden">
                                                <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            </div>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Sign Out"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link href="/profile" onClick={handleNavigate} className="flex-1 flex items-center gap-3 p-2 rounded-xl hover:bg-card-hover cursor-pointer transition-colors group min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px] flex-shrink-0">
                                            <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center overflow-hidden">
                                                <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                                            <p className="text-xs text-text-secondary truncate">{user?.email || "Premium"}</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Sign Out"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link 
                            href="/login" 
                            onClick={handleNavigate} 
                            className={cn(
                                "flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all",
                                isCollapsed && "p-3"
                            )}
                            title={isCollapsed ? "Sign In" : undefined}
                        >
                            <LogIn size={20} />
                            {!isCollapsed && "Sign In"}
                        </Link>
                    )}
                </div>
            </aside>
        </>
    )
}

export default Sidebar
