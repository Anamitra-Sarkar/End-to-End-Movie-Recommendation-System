"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Play } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup (visually similar for this demo)
    const [formData, setFormData] = useState({ username: '', email: '' });
    const { login } = useUser();
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.username || !formData.email) return; // Simple validation

        // Login logic
        login({
            username: formData.username,
            email: formData.email,
        });

        router.push('/'); // Redirect to home
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
            {/* Background with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1540951469954-203642ce878e?auto=format&fit=crop&q=80&w=2000")' }}
            />
            <div className="absolute inset-0 bg-black/70 z-10 backdrop-blur-sm" />

            {/* Login Card */}
            <div className="relative z-20 w-full max-w-md p-8 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(233,69,96,0.6)]">
                        <Play fill="white" className="text-white ml-1" size={20} />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        CinePredict
                    </h1>
                </div>

                <h2 className="text-2xl font-semibold text-white mb-2 text-center">
                    {isLogin ? 'Welcome Back' : 'Join the Universe'}
                </h2>
                <p className="text-text-secondary text-sm text-center mb-8">
                    {isLogin ? 'Enter your details to sign in' : 'Create your free account today'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-text-secondary tracking-wider ml-1">Username</label>
                        <input
                            type="text"
                            placeholder="e.g. MovieBuff99"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-3 text-white placeholder-white/20 transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-text-secondary tracking-wider ml-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-3 text-white placeholder-white/20 transition-all outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(233,69,96,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-text-secondary text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white font-semibold hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
