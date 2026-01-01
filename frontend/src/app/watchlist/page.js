"use client";

import React, { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import MovieCard from '@/components/MovieCard'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { subscribeToWatchlist } from '@/lib/watchlist'
import Link from 'next/link'

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { user, isLoading: authLoading } = useAuth()
    const { showNotification } = useNotification()

    useEffect(() => {
        if (!user?.uid) {
            setIsLoading(false)
            setWatchlist([])
            return
        }

        setIsLoading(true)

        // Subscribe to real-time watchlist updates
        const unsubscribe = subscribeToWatchlist(
            user.uid,
            (movies) => {
                setWatchlist(movies)
                setIsLoading(false)
            },
            (error) => {
                console.error('Error loading watchlist:', error)
                showNotification('Failed to load watchlist', 'error')
                setIsLoading(false)
            }
        )

        // Cleanup subscription on unmount or user change
        return () => unsubscribe()
    }, [user?.uid, showNotification])

    if (authLoading || isLoading) {
        return (
            <div className="min-h-full pt-24 pb-20 px-8 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        )
    }

    return (
        <div className="min-h-full pt-24 pb-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-white flex items-center gap-3">
                        <Heart className="text-red-500 fill-red-500" size={36} />
                        My Watchlist
                    </h1>
                </div>

                {!user && (
                    <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm text-text-secondary">
                        <span className="text-primary font-semibold">Tip:</span> 
                        <Link href="/login" className="text-primary hover:underline ml-1">Sign in</Link> to sync your watchlist across devices!
                    </div>
                )}

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
