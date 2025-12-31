"use client";

import { use } from 'react'
import MovieDashboard from '@/components/MovieDashboard'

export default function CategoryPage({ params }) {
    const { category } = use(params);

    // Map category to genre
    let initialFilters = {};
    let displayTitle = category.charAt(0).toUpperCase() + category.slice(1);

    switch (category) {
        case 'movies':
            initialFilters = { genre: '' };
            displayTitle = "All Movies";
            break;
        case 'tv-shows':
            initialFilters = { genre: 'Drama' }; // Mock for TV
            displayTitle = "TV Shows";
            break;
        case 'anime':
            initialFilters = { genre: 'Animation' };
            displayTitle = "Anime Universe";
            break;
        case 'kids':
            initialFilters = { genre: 'Family' };
            displayTitle = "Kids & Family";
            break;
        default:
            initialFilters = { genre: '' };
    }

    return (
        <MovieDashboard
            initialFilters={initialFilters}
            title={displayTitle}
            mode="grid" // Category pages show "numerous movies"
        />
    )
}
