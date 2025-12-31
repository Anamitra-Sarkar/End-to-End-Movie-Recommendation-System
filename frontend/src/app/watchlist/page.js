"use client";

import React, { useState, useEffect } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import MovieCard from '@/components/MovieCard'

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState([])

    useEffect(() => {
        loadWatchlist();
        window.addEventListener('storage', loadWatchlist);
        return () => window.removeEventListener('storage', loadWatchlist);
    }, [])

    const loadWatchlist = () => {
        const saved = JSON.parse(localStorage.getItem('watchlist') || '[]');
        setWatchlist(saved);
    }

    const clearWatchlist = () => {
        localStorage.setItem('watchlist', '[]');
        setWatchlist([]);
    }

    return (
        <div className="min-h-full pt-24 pb-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-white flex items-center gap-3">
                        <Heart className="text-red-500 fill-red-500" size={36} />
                        My Watchlist
                    </h1>
                    {watchlist.length > 0 && (
                        <button
                            onClick={clearWatchlist}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 size={16} /> Clear All
                        </button>
                    )}
                </div>

                {watchlist.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-white/5">
                        <Heart size={64} className="mx-auto mb-4 text-text-secondary opacity-30" />
                        <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
                        <p className="text-text-secondary">Start adding movies by clicking the heart icon on any movie card!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {watchlist.map((movie) => (
                            <MovieCard key={movie.id} {...movie} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
