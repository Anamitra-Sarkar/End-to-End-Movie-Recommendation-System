"use client";

import React, { useState, useEffect, useMemo } from 'react'
import { Star, Heart, Film } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { useSmartNotify } from '@/context/SmartNotifyContext'
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist'

const MovieCard = ({ id, title, poster, rating, genre, year }) => {
    const [imageError, setImageError] = useState(false)
    const [imgSrc, setImgSrc] = useState(poster)
    const [isWatchlisted, setIsWatchlisted] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const { user } = useAuth()
    const { showNotification } = useNotification()
    const { triggerWatchlistAdd } = useSmartNotify()

    // Check if ID is valid (numeric or parseable as number) - memoized to avoid re-parsing
    const isValidId = useMemo(() => {
        const parsedId = parseInt(id);
        return id && !isNaN(parsedId) && parsedId > 0;
    }, [id]);

    useEffect(() => {
        // Check if movie is in watchlist - only for valid IDs
        const checkWatchlist = async () => {
            if (user?.uid && isValidId) {
                try {
                    const inWatchlist = await isInWatchlist(user.uid, id)
                    setIsWatchlisted(inWatchlist)
                } catch (error) {
                    console.error('Error checking watchlist:', error)
                    setIsWatchlisted(false)
                }
            } else {
                setIsWatchlisted(false)
            }
        }
        checkWatchlist()
    }, [id, user, isValidId])

    useEffect(() => {
        if (poster) {
            setImgSrc(poster);
            setImageError(false);
        }
    }, [poster]);

    const toggleWatchlist = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (isUpdating) return;
        
        // Require login for watchlist functionality
        if (!user?.uid) {
            showNotification('Please sign in to use the watchlist feature', 'info');
            return;
        }

        setIsUpdating(true);

        const movie = { id, title, poster, rating, genre, year };

        try {
            if (isWatchlisted) {
                await removeFromWatchlist(user.uid, id);
                showNotification(`${title} removed from Watchlist`, 'info');
                setIsWatchlisted(false);
            } else {
                await addToWatchlist(user.uid, movie);
                showNotification(`${title} added to Watchlist! 🎬`, 'success');
                triggerWatchlistAdd(title);
                setIsWatchlisted(true);
            }
        } catch (error) {
            console.error('Watchlist error:', error);
            showNotification('Failed to update watchlist. Please try again.', 'error');
        } finally {
            setIsUpdating(false);
        }
    }

    const CardWrapper = isValidId ? Link : 'div';
    const wrapperProps = isValidId ? { href: `/movie/${id}` } : {};

    return (
        <CardWrapper {...wrapperProps}>
            <motion.div
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    "relative group rounded-xl overflow-hidden bg-card border border-white/5 shadow-2xl aspect-[2/3]",
                    isValidId ? "cursor-pointer" : "cursor-default"
                )}
            >
                {/* Poster Image or Fallback */}
                {imageError || !imgSrc ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 text-center">
                        <div>
                            <Film className="w-12 h-12 text-white/20 mx-auto mb-2" />
                            <span className="text-white/60 font-bold text-sm line-clamp-2">{title || "Movie"}</span>
                        </div>
                    </div>
                ) : (
                    <img
                        src={imgSrc}
                        alt={title || "Movie Poster"}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                {/* Watchlist Heart Button (Top Right) - ALWAYS VISIBLE */}
                <div className="absolute top-2 right-2 z-20">
                    <div
                        onClick={toggleWatchlist}
                        className={cn(
                            "p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 border shadow-lg cursor-pointer active:scale-95 hover:scale-105",
                            isWatchlisted
                                ? "bg-red-500 text-white border-red-400 hover:bg-red-600"
                                : "bg-black/60 backdrop-blur-md text-white border-white/20 hover:bg-white/20",
                            isUpdating && "opacity-50 cursor-wait"
                        )}
                        title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                        <Heart
                            size={18}
                            className={cn("transition-transform", isWatchlisted && "fill-current")}
                        />
                    </div>
                </div>

                {/* Rating Badge (Top Left) - ALWAYS VISIBLE */}
                <div className="absolute top-2 left-2 z-10">
                    <div className="bg-primary/90 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 shadow-lg border border-white/10">
                        <Star size={12} className="text-white fill-white" />
                        <span className="text-xs font-black text-white">{rating ? parseFloat(rating).toFixed(1) : "N/A"}</span>
                    </div>
                </div>

                {/* Content (Bottom) */}
                <div className="absolute bottom-0 left-0 w-full p-4 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0 text-shadow z-10">
                    <h3 className="text-sm font-black text-white mb-0.5 leading-tight line-clamp-2 drop-shadow-lg">{title || "Untitled"}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest opacity-80">
                        <span>{genre || "Movie"}</span>
                        <span>•</span>
                        <span>{year || "Premium"}</span>
                    </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/40 rounded-xl transition-all pointer-events-none shadow-[inset_0_0_20px_rgba(37,99,235,0.2)]" />
            </motion.div>
        </CardWrapper>
    )
}

export default MovieCard
