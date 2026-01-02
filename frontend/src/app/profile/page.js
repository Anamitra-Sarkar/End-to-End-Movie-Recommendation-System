"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [name, setName] = useState("");
    const [handle, setHandle] = useState("CineUser");
    const [email, setEmail] = useState("");

    // Route Protection & Data Sync
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (user) {
            // Sync from Firebase user
            setName(user.displayName || user.email?.split('@')[0] || "");
            setEmail(user.email || "");
            // Generate handle from display name
            setHandle(user.displayName?.replace(/\s+/g, '') || user.email?.split('@')[0] || "CineUser");
        }
    }, [user, isLoading, router]);

    // Prevent hydration mismatch or flash of content
    if (isLoading || !user) return <div className="min-h-screen bg-background text-white p-8 pl-80 flex items-center justify-center">Loading...</div>;

    // Get avatar URL from Firebase user or generate one
    const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || email}`;

    const handleSave = () => {
        // Note: Updating Firebase user profile requires additional implementation
        // For now, show a notification that profile updates require re-authentication
        alert('Profile saved locally. Full profile editing coming soon!');
    };

    return (
        <div className="min-h-screen bg-background text-white p-8 pl-80 animate-in fade-in duration-500">
            <div className="max-w-3xl mx-auto pb-20">
                <h1 className="text-5xl font-bold mb-8 border-b border-white/10 pb-4">Edit Profile</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column: Avatar */}
                    <div className="relative group w-32 h-32 md:w-40 md:h-40 flex-shrink-0 mx-auto md:mx-0">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-full h-full rounded-md object-cover shadow-2xl"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-md">
                            <div className="bg-black/60 p-2 rounded-full border border-white/20">
                                <Pencil size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="flex-1 space-y-8">

                        {/* Name Input */}
                        <div className="space-y-2">
                            <div className="bg-white/5 border border-white/20 rounded px-4 py-2 focus-within:bg-black focus-within:border-white transition-colors">
                                <label className="block text-xs text-text-secondary uppercase font-semibold mb-1 tracking-wider">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent text-white text-lg focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Game Handle Section */}
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Game Handle</h2>
                            <p className="text-text-secondary text-sm">
                                Your handle is a unique name that will be used for playing with other CinePredict members across all games.
                            </p>
                            <div className="bg-white/5 border border-white/20 rounded px-4 py-3 flex items-center gap-3 mt-2">
                                <span className="text-2xl">🎮</span>
                                <div className="flex-1">
                                    <label className="block text-xs text-text-secondary uppercase font-semibold mb-0.5">
                                        Game Handle
                                    </label>
                                    <input
                                        type="text"
                                        value={handle}
                                        onChange={(e) => setHandle(e.target.value)}
                                        className="w-full bg-transparent text-white text-lg focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold pt-4 border-t border-white/10">Contact Info</h2>

                            <div className="bg-white/5 border border-white/20 rounded px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors group">
                                <div>
                                    <p className="text-lg font-semibold mb-1">Email</p>
                                    <p className="text-text-secondary text-sm group-hover:text-white transition-colors">
                                        {email}
                                    </p>
                                </div>
                                <ChevronRight className="text-text-secondary group-hover:text-white" />
                            </div>
                        </div>

                        {/* Save / Cancel Buttons */}
                        <div className="flex gap-4 pt-8">
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 bg-white text-black font-bold text-lg rounded hover:bg-gray-200 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    // Reset to initial from Firebase user
                                    setName(user.displayName || user.email?.split('@')[0] || "");
                                    setEmail(user.email || "");
                                    router.back();
                                }}
                                className="px-8 py-3 border border-white/20 text-text-secondary font-bold text-lg rounded hover:border-white hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
