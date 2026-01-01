"use client";

import React, { useState, useEffect } from 'react'
import { MessageCircle, Star, Heart, Reply, Users, Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { subscribeToCommunityPosts, addCommunityPost } from '@/lib/community'

const MOCK_REVIEWS = [
    { id: 1, user: "CinephileMax", avatar: "🎬", movie: "Inception", rating: 5, content: "Mind-bending masterpiece! Nolan outdid himself.", likes: 234, replies: 45, createdAt: new Date() },
    { id: 2, user: "MovieBuff_Sarah", avatar: "🍿", movie: "The Dark Knight", rating: 5, content: "Heath Ledger's Joker is legendary. Best villain ever.", likes: 567, replies: 89, createdAt: new Date() },
    { id: 3, user: "FilmCritic101", avatar: "🎥", movie: "Interstellar", rating: 4, content: "Visually stunning. The docking scene had me on edge!", likes: 189, replies: 32, createdAt: new Date() },
    { id: 4, user: "AnimeKing", avatar: "🌸", movie: "Spirited Away", rating: 5, content: "Studio Ghibli magic at its finest. A timeless classic.", likes: 445, replies: 67, createdAt: new Date() },
    { id: 5, user: "ActionJunkie", avatar: "💥", movie: "Avatar", rating: 4, content: "Pandora is breathtaking. Can't wait for the sequels!", likes: 312, replies: 48, createdAt: new Date() },
];

export default function CommunityPage() {
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ content: '', movie: '', rating: 5 })
    const { user } = useAuth()
    const { showNotification } = useNotification()

    useEffect(() => {
        // Subscribe to real-time community posts from Firestore
        const unsubscribe = subscribeToCommunityPosts(
            (firestorePosts) => {
                if (firestorePosts.length > 0) {
                    setPosts(firestorePosts)
                } else {
                    // Use mock data if no posts from Firestore
                    setPosts(MOCK_REVIEWS)
                }
                setIsLoading(false)
            },
            (error) => {
                console.error('Error fetching posts:', error)
                // Use mock data on error
                setPosts(MOCK_REVIEWS)
                setIsLoading(false)
            }
        )

        // Cleanup subscription on unmount
        return () => unsubscribe()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.content.trim()) {
            showNotification('Please write something!', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            const displayName = user?.displayName || user?.email?.split('@')[0] || 'Anonymous'
            
            await addCommunityPost({
                user: displayName,
                content: formData.content,
                movie: formData.movie || undefined,
                rating: formData.movie ? formData.rating : undefined,
                avatar: '🎬',
            })

            showNotification('Post created! 🎉', 'success')
            setFormData({ content: '', movie: '', rating: 5 })
            setShowForm(false)
        } catch (error) {
            console.error('Error creating post:', error)
            showNotification('Failed to create post. Please try again.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (dateValue) => {
        // Safely convert to Date object
        let date;
        if (dateValue instanceof Date) {
            date = dateValue;
        } else if (dateValue) {
            date = new Date(dateValue);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Recently';
            }
        } else {
            return 'Recently';
        }
        
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes} min ago`
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
        return `${days} day${days > 1 ? 's' : ''} ago`
    }

    return (
        <div className="min-h-full pt-24 pb-20 px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                        <Users className="text-primary" size={36} />
                        <h1 className="text-4xl font-black text-white">Community</h1>
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors"
                        >
                            <Send size={18} />
                            New Post
                        </button>
                    )}
                </div>

                <p className="text-text-secondary mb-8">See what others are watching and saying about their favorite films!</p>

                {/* New Post Form */}
                {showForm && user && (
                    <form onSubmit={handleSubmit} className="mb-8 bg-card rounded-2xl border border-white/5 p-6 animate-in slide-in-from-top duration-300">
                        <h3 className="text-lg font-bold text-white mb-4">Share your thoughts</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Movie Title (optional)</label>
                                <input
                                    type="text"
                                    value={formData.movie}
                                    onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
                                    placeholder="e.g., Inception, The Dark Knight..."
                                    className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-3 text-white placeholder-white/30 transition-all outline-none"
                                />
                            </div>

                            {formData.movie && (
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    size={24}
                                                    className={star <= formData.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Your Review</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="What did you think about the movie?"
                                    rows={4}
                                    maxLength={500}
                                    className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-3 text-white placeholder-white/30 transition-all outline-none resize-none"
                                    required
                                />
                                <p className="text-xs text-text-secondary mt-1">{formData.content.length}/500</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    {isSubmitting ? 'Posting...' : 'Post'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {!user && (
                    <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm text-text-secondary">
                        <span className="text-primary font-semibold">Want to share your reviews?</span> 
                        <a href="/login" className="text-primary hover:underline ml-1">Sign in</a> to post in the community!
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post.id || post._id} className="bg-card rounded-2xl border border-white/5 p-6 hover:border-primary/20 transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">{post.avatar || '🎬'}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <span className="font-bold text-white">{post.user}</span>
                                                {post.movie && (
                                                    <>
                                                        <span className="text-text-secondary mx-2">reviewed</span>
                                                        <span className="text-primary font-semibold">{post.movie}</span>
                                                    </>
                                                )}
                                            </div>
                                            {post.rating && (
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={16}
                                                            className={i < post.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-300 mb-2">{post.content || post.comment}</p>
                                        <div className="flex items-center gap-6 text-sm text-text-secondary">
                                            <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                                <Heart size={16} /> {post.likes}
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-primary transition-colors">
                                                <Reply size={16} /> {post.replies} replies
                                            </button>
                                            <span className="text-xs">{formatDate(post.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
