"use client";

import React, { useState, useEffect, use } from 'react'
import { Star, Calendar, Clock, Play, Heart, Share2, ArrowLeft, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getMovieDetails, getRecommendations, searchMovieByTitle } from '@/services/api'
import MovieCard from '@/components/MovieCard'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { useSmartNotify } from '@/context/SmartNotifyContext'
import { addToRecents } from '@/lib/recents'
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist'

export default function MovieDetailsPage({ params }) {
    // Unwrap params for Next.js 15+ compatibility
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const router = useRouter()
    const [movie, setMovie] = useState(null)
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isWatchlisted, setIsWatchlisted] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [copied, setCopied] = useState(false)
    const { user } = useAuth()
    const { showNotification } = useNotification()
    const { triggerWatchlistAdd } = useSmartNotify()

    useEffect(() => {
        if (!id) return;

        fetchData();
    }, [id])

    // Check watchlist status when user or id changes
    useEffect(() => {
        const checkWatchlistStatus = async () => {
            if (user?.uid && id) {
                try {
                    const inWatchlist = await isInWatchlist(user.uid, parseInt(id))
                    setIsWatchlisted(inWatchlist)
                } catch (error) {
                    console.error('Error checking watchlist:', error)
                    setIsWatchlisted(false)
                }
            } else {
                setIsWatchlisted(false)
            }
        }
        checkWatchlistStatus()
    }, [id, user])

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get Details
            const details = await getMovieDetails(id);
            setMovie(details);

            // 2. Add to recents
            if (details) {
                const recentMovie = {
                    id: details.id,
                    title: details.title,
                    poster: details.poster,
                    rating: details.rating,
                    genre: details.genres?.[0] || 'Movie',
                    year: details.year,
                };
                addToRecents(user?.uid || null, recentMovie);
            }

            // 3. Get Recommendations based on title
            if (details.title) {
                try {
                    const recData = await getRecommendations(details.title);
                    if (recData.movies && recData.posters && recData.movies.length > 0) {
                        // Fetch full movie details for each recommendation to get proper IDs and ratings
                        const recPromises = recData.movies.slice(0, 6).map(async (title) => {
                            try {
                                 const movieDetails = await searchMovieByTitle(title);
                                if (movieDetails && movieDetails.id && !isNaN(parseInt(movieDetails.id))) {
                                    // Only return valid movies with real IDs
                                    return {
                                        id: movieDetails.id,
                                        title: movieDetails.title,
                                        poster_path: movieDetails.poster_path || movieDetails.poster,
                                        poster: movieDetails.poster_path || movieDetails.poster,
                                        vote_average: movieDetails.vote_average || movieDetails.rating,
                                        rating: movieDetails.vote_average || movieDetails.rating,
                                        year: movieDetails.year,
                                        genre: movieDetails.genre || 'Recommended'
                                    };
                                }
                            } catch (err) {
                                // Silently skip failed recommendation fetches
                            }
                            return null;
                        });
                        
                        const recs = await Promise.all(recPromises);
                        // Filter out null values (failed fetches) - only show valid movies
                        const validRecs = recs.filter(rec => rec !== null);
                        setRecommendations(validRecs);
                    }
                } catch (err) {
                    // Silently fail - recommendations are optional
                    // Error is already logged in the API service
                    setRecommendations([]);
                }
            }
        } catch (err) {
            console.error(err);
            setError("Failed to monitor transmission.");
        } finally {
            setLoading(false);
        }
    }

    const toggleWatchlist = async () => {
        if (!movie) return;
        if (isUpdating) return;

        // Require login for watchlist functionality
        if (!user?.uid) {
            showNotification('Please sign in to use the watchlist feature', 'info');
            return;
        }

        setIsUpdating(true);

        const movieData = {
            id: movie.id,
            title: movie.title,
            poster: movie.poster,
            rating: movie.rating,
            genre: movie.genres?.[0] || 'Movie',
            year: movie.year
        };

        try {
            if (isWatchlisted) {
                await removeFromWatchlist(user.uid, movie.id);
                showNotification(`${movie.title} removed from Watchlist`, 'info');
                setIsWatchlisted(false);
            } else {
                await addToWatchlist(user.uid, movieData);
                showNotification(`${movie.title} added to Watchlist! 🎬`, 'success');
                triggerWatchlistAdd(movie.title);
                setIsWatchlisted(true);
            }
        } catch (error) {
            console.error('Watchlist error:', error);
            showNotification('Failed to update watchlist. Please try again.', 'error');
        } finally {
            setIsUpdating(false);
        }
    }

    const handleShare = async () => {
        const url = window.location.href;
        
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            showNotification('Link copied to clipboard!', 'success');
            
            // Reset copied state after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy link', 'error');
        }
    }

    const handleBackToBrowse = () => {
        // Use deterministic routing - always go to browse page
        router.push('/browse')
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (error || !movie) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-text-secondary">
            <h1 className="text-2xl font-bold mb-4">Signal Lost</h1>
            <button 
                onClick={() => router.push('/browse')}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
                Return to Base
            </button>
        </div>
    )

    return (
        <div className="min-h-full pb-20">
            {/* Hero Backdrop */}
            <div className="relative w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
                <img
                    src={movie.poster ? movie.poster.replace('w500', 'original') : "https://placehold.co/1920x1080?text=No+Backdrop"}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    style={{ minHeight: '600px' }}
                />

                <div className="relative z-20 px-4 sm:px-8 md:px-16 pt-20 pb-16 md:pb-24">
                    <div className="max-w-4xl w-full">
                        <button 
                            onClick={handleBackToBrowse}
                            className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-4 md:mb-6 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={20} /> Back to Browse
                        </button>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 leading-tight tracking-tight break-words"
                            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                        >
                            {movie.title}
                        </motion.h1>

                        <div className="flex items-center flex-wrap gap-2 md:gap-4 text-xs sm:text-sm md:text-base text-gray-300 mb-6 md:mb-8 font-medium">
                            <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 md:px-3 py-1 rounded-full border border-yellow-500/20">
                                <Star size={14} className="md:w-4 md:h-4" fill="currentColor" /> {movie.rating.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar size={14} className="md:w-4 md:h-4" /> {movie.year}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} className="md:w-4 md:h-4" /> {movie.runtime}m
                            </span>
                            {movie.genres.map(g => (
                                <span key={g} className="px-2 md:px-3 py-1 bg-white/10 rounded-full text-xs md:text-sm">{g}</span>
                            ))}
                        </div>

                        <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 md:mb-12 leading-relaxed max-w-3xl line-clamp-4">
                            {movie.overview}
                        </p>

                        <div className="flex items-center flex-wrap gap-3 md:gap-4 pb-8">
                            <button className="flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 bg-primary hover:bg-primary/90 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-transform active:scale-95 shadow-lg shadow-primary/25">
                                <Play fill="currentColor" className="w-4 h-4 md:w-5 md:h-5" /> Coming Soon
                            </button>
                            <button
                                onClick={toggleWatchlist}
                                disabled={isUpdating}
                                className={cn(
                                    "p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all active:scale-95",
                                    isWatchlisted ? "bg-red-500 border-red-500 text-white" : "border-white/20 text-white hover:bg-white/10",
                                    isUpdating && "opacity-50 cursor-wait"
                                )}
                            >
                                <Heart fill={isWatchlisted ? "currentColor" : "none"} className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <button 
                                onClick={handleShare}
                                className={cn(
                                    "p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all active:scale-95",
                                    copied 
                                        ? "bg-green-500 border-green-500 text-white" 
                                        : "border-white/20 text-white hover:bg-white/10"
                                )}
                            >
                                {copied ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Share2 className="w-5 h-5 md:w-6 md:h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & Recommendations */}
            <div className="px-4 sm:px-8 md:px-16 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Details Column */}
                    <div className="lg:col-span-2 space-y-8 md:space-y-12">
                        {/* Cast */}
                        <section className="w-full">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
                                <div className="w-1 h-6 md:h-8 bg-primary rounded-full" /> Top Cast
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="p-4 bg-card rounded-xl border border-white/5 w-full">
                                    <p className="text-text-secondary italic text-sm md:text-base">Stay tuned for the full cast lineup.</p>
                                </div>
                            </div>
                        </section>

                        {/* Recommendations */}
                        <section className="w-full">
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
                                <div className="w-1 h-6 md:h-8 bg-primary rounded-full" /> More Like This
                            </h3>
                            {recommendations.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                    {recommendations.map((rec) => (
                                        <MovieCard key={rec.id} {...rec} />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-card rounded-xl border border-white/5">
                                    <p className="text-text-secondary text-sm md:text-base">No recommendations available at this time.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-6 w-full">
                        <div className="bg-card p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 space-y-4 md:space-y-6 w-full">
                            <div>
                                <h4 className="text-text-secondary text-xs md:text-sm font-bold uppercase tracking-wider mb-2">Director</h4>
                                <p className="text-white font-medium text-base md:text-lg break-words">{movie.director}</p>
                            </div>
                            <div>
                                <h4 className="text-text-secondary text-xs md:text-sm font-bold uppercase tracking-wider mb-2">Tagline</h4>
                                <p className="text-white italic text-sm md:text-base break-words">"{movie.tagline}"</p>
                            </div>
                            <div>
                                <h4 className="text-text-secondary text-xs md:text-sm font-bold uppercase tracking-wider mb-2">Status</h4>
                                <p className="text-primary font-bold text-sm md:text-base">Released</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
