"use client";

import React from 'react'
import { MessageCircle, Star, Heart, Reply, Users } from 'lucide-react'

const MOCK_REVIEWS = [
    { id: 1, user: "CinephileMax", avatar: "🎬", movie: "Inception", rating: 5, comment: "Mind-bending masterpiece! Nolan outdid himself.", likes: 234, replies: 45 },
    { id: 2, user: "MovieBuff_Sarah", avatar: "🍿", movie: "The Dark Knight", rating: 5, comment: "Heath Ledger's Joker is legendary. Best villain ever.", likes: 567, replies: 89 },
    { id: 3, user: "FilmCritic101", avatar: "🎥", movie: "Interstellar", rating: 4, comment: "Visually stunning. The docking scene had me on edge!", likes: 189, replies: 32 },
    { id: 4, user: "AnimeKing", avatar: "🌸", movie: "Spirited Away", rating: 5, comment: "Studio Ghibli magic at its finest. A timeless classic.", likes: 445, replies: 67 },
    { id: 5, user: "ActionJunkie", avatar: "💥", movie: "Avatar", rating: 4, comment: "Pandora is breathtaking. Can't wait for the sequels!", likes: 312, replies: 48 },
];

export default function CommunityPage() {
    return (
        <div className="min-h-full pt-24 pb-20 px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Users className="text-primary" size={36} />
                    <h1 className="text-4xl font-black text-white">Community Reviews</h1>
                </div>

                <p className="text-text-secondary mb-8">See what others are watching and saying about their favorite films!</p>

                <div className="space-y-6">
                    {MOCK_REVIEWS.map((review) => (
                        <div key={review.id} className="bg-card rounded-2xl border border-white/5 p-6 hover:border-primary/20 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{review.avatar}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="font-bold text-white">{review.user}</span>
                                            <span className="text-text-secondary mx-2">reviewed</span>
                                            <span className="text-primary font-semibold">{review.movie}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 mb-4">{review.comment}</p>
                                    <div className="flex items-center gap-6 text-sm text-text-secondary">
                                        <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                            <Heart size={16} /> {review.likes}
                                        </button>
                                        <button className="flex items-center gap-2 hover:text-primary transition-colors">
                                            <Reply size={16} /> {review.replies} replies
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
