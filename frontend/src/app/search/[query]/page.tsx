"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import MovieDashboard from '@/components/MovieDashboard';
import { Search } from 'lucide-react';

export default function SearchPage() {
    const params = useParams();
    const query = decodeURIComponent(params.query as string || '');

    return (
        <div className="min-h-full">
            <div className="pt-24 px-8 pb-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                    <Search className="text-primary" size={32} />
                    <h1 className="text-3xl font-black text-white">
                        Search Results
                    </h1>
                </div>
                <p className="text-text-secondary mb-6">
                    Showing results for: <span className="text-primary font-semibold">&quot;{query}&quot;</span>
                </p>
            </div>
            <MovieDashboard
                initialFilters={{ search: query }}
                title={`Results for "${query}"`}
                enableSearch={false}
                mode="grid"
            />
        </div>
    );
}
