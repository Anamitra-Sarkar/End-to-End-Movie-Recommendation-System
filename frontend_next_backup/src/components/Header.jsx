import React from 'react'
import { Bell, Search } from 'lucide-react'

const Header = () => {
    return (
        <header className="absolute top-0 right-0 p-6 flex items-center justify-end gap-4 z-40">
            <button className="p-3 bg-card/50 hover:bg-card rounded-full text-white backdrop-blur-sm transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-3 bg-card/50 hover:bg-card rounded-full text-white backdrop-blur-sm transition-colors">
                <Search size={20} />
            </button>
        </header>
    )
}

export default Header
