"use client";

import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MovieCard from '@/components/MovieCard'
import MovieRow from '@/components/MovieRow'
import { getSuggestions, getMovies } from '@/services/api'
import { cn } from '@/lib/utils'

// MOCK DATA - Always shows movies even if backend fails
const MOCK_MOVIES = [
    { id: 550, title: "Fight Club", poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", rating: 8.4, genre: "Drama", year: 1999 },
    { id: 157336, title: "Interstellar", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", rating: 8.6, genre: "Sci-Fi", year: 2014 },
    { id: 27205, title: "Inception", poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", rating: 8.4, genre: "Action", year: 2010 },
    { id: 155, title: "The Dark Knight", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", rating: 9.0, genre: "Action", year: 2008 },
    { id: 19995, title: "Avatar", poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", rating: 7.6, genre: "Action", year: 2009 },
    { id: 680, title: "Pulp Fiction", poster: "https://image.tmdb.org/t/p/w500/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg", rating: 8.5, genre: "Crime", year: 1994 },
    { id: 13, title: "Forrest Gump", poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", rating: 8.5, genre: "Drama", year: 1994 },
    { id: 122, title: "The Lord of the Rings", poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", rating: 8.8, genre: "Fantasy", year: 2001 },
    { id: 603, title: "The Matrix", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", rating: 8.2, genre: "Sci-Fi", year: 1999 },
    { id: 11, title: "Star Wars", poster: "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", rating: 8.2, genre: "Sci-Fi", year: 1977 },
    { id: 129, title: "Spirited Away", poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", rating: 8.5, genre: "Animation", year: 2001 },
    { id: 128, title: "Princess Mononoke", poster: "https://image.tmdb.org/t/p/w500/jHWmNr7m544fJ8eItsfNk8fs2Ed.jpg", rating: 8.3, genre: "Animation", year: 1997 },
    { id: 862, title: "Toy Story", poster: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", rating: 7.9, genre: "Family", year: 1995 },
    { id: 12, title: "Finding Nemo", poster: "https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg", rating: 7.8, genre: "Family", year: 2003 },
    { id: 120, title: "LOTR: Fellowship", poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", rating: 8.8, genre: "Fantasy", year: 2001 },
];

const SORTS = [
    { label: "Popularity", value: "popularity.desc" },
    { label: "Rating", value: "vote_average.desc" },
    { label: "Newest", value: "release_date.desc" }
];

export default function MovieDashboard({
    initialFilters = {},
    title = "Trending Now",
    enableSearch = true,
    mode = 'grid'
}) {
    const [filters, setFilters] = useState({
        search: '',
        genre: '',
        sort: 'popularity.desc',
        page: 1,
        ...initialFilters
    });

    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (enableSearch) getSuggestions().then(setSuggestions).catch(() => { })
    }, [enableSearch])

    useEffect(() => {
        setFilters(prev => ({ ...prev, ...initialFilters, page: 1 }));
    }, [JSON.stringify(initialFilters)]);

    useEffect(() => {
        fetchMovies();
    }, [filters]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load cached movies instantly on mount
    useEffect(() => {
        if (mode === 'home') {
            const cached = localStorage.getItem('cachedMovies');
            if (cached) {
                try {
                    setMovies(JSON.parse(cached));
                    setLoading(false); // Show content immediately
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }
        }
    }, [mode]);

    const fetchMovies = async () => {
        // Only show loading spinner if we didn't have cache (or if it's a specific search/filter)
        if (!movies.length) setLoading(true);

        setError(null);
        try {
            const data = await getMovies(filters);
            if (data.movies && data.movies.length > 0) {
                setMovies(data.movies);
                // Update cache if in home mode (default view)
                if (mode === 'home' && !filters.search && !filters.genre) {
                    localStorage.setItem('cachedMovies', JSON.stringify(data.movies));
                }
            } else {
                setMovies(filterMockMovies());
            }
        } catch (err) {
            console.error("API failed, using mock data:", err);
            // Don't overwrite state with mock data if we already have valid cached data
            // unless the cache was empty to begin with
            if (movies.length === 0) {
                setMovies(filterMockMovies());
            }
        } finally {
            setLoading(false);
        }
    }

    const filterMockMovies = () => {
        let filtered = [...MOCK_MOVIES];
        if (filters.genre) {
            filtered = filtered.filter(m => m.genre.toLowerCase().includes(filters.genre.toLowerCase()));
        }
        if (filters.search) {
            filtered = filtered.filter(m => m.title.toLowerCase().includes(filters.search.toLowerCase()));
        }
        return filtered.length > 0 ? filtered : MOCK_MOVIES;
    }

    const handleSearchInput = (e) => {
        const val = e.target.value;
        setFilters(prev => ({ ...prev, search: val, page: 1 }));
        setShowSuggestions(val.length > 0);
    }

    const handleSearchFocus = () => {
        if (suggestions.length > 0) setShowSuggestions(true);
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
        setActiveDropdown(null);
    }

    const filteredSuggestions = filters.search
        ? suggestions.filter(s => s && s.toLowerCase().includes(filters.search.toLowerCase())).slice(0, 10)
        : suggestions.slice(0, 10);

    return (
        <div className="min-h-full pb-20">
            {enableSearch && (
                <section className="relative pt-32 pb-10 px-8 z-40">
                    <div className="max-w-4xl mx-auto text-center relative">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-black mb-6 tracking-tight"
                        >
                            Explore the <span className="text-primary">Cinematic Universe</span>
                        </motion.h1>

                        <div className="relative max-w-xl mx-auto w-full group z-50">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="text-text-secondary group-focus-within:text-primary transition-colors" size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={handleSearchInput}
                                    onFocus={handleSearchFocus}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-white/5 focus:border-primary/50 ring-0 focus:ring-4 focus:ring-primary/10 text-white placeholder-text-secondary transition-all outline-none"
                                    placeholder="Search for titles, genres, or directors..."
                                />
                                <button className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-white px-6 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20">
                                    Search
                                </button>
                            </div>

                            <AnimatePresence>
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                                    >
                                        {filteredSuggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleFilterChange('search', suggestion)}
                                                className="px-4 py-3 hover:bg-white/5 cursor-pointer text-text-secondary hover:text-white transition-colors flex items-center gap-3"
                                            >
                                                <Search size={14} className="opacity-50" />
                                                {suggestion}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            )}

            {!enableSearch && <div className="pt-24" />}

            <section className="px-8 max-w-7xl mx-auto relative z-10 mt-4">

                {mode === 'home' && !filters.search ? (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        <MovieRow title="Recently Watched" params={{ sort: 'release_date.desc' }} mockData={MOCK_MOVIES.slice(0, 8)} />
                        <MovieRow title="Recommended for You" params={{ sort: 'popularity.desc' }} mockData={MOCK_MOVIES.slice(3, 11)} />
                        <MovieRow title="Action Hits" params={{ genre: 'Action' }} mockData={MOCK_MOVIES.filter(m => m.genre === 'Action')} />
                        <MovieRow title="Trending Now" params={{ sort: 'vote_average.desc' }} mockData={MOCK_MOVIES.slice(5, 13)} />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-l-4 border-primary pl-4">
                            <h2 className="text-3xl font-black text-white">
                                {filters.search ? `Results for "${filters.search}"` : title}
                            </h2>

                            <div className="flex items-center gap-4" ref={dropdownRef}>
                                <div className="relative">
                                    <button onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')} className="flex items-center gap-2 px-6 py-2 bg-card border border-white/5 rounded-full text-sm font-bold text-text-secondary hover:text-white transition-all hover:scale-105 active:scale-95">
                                        Sort: {SORTS.find(s => s.value === filters.sort)?.label} <ChevronDown size={14} />
                                    </button>
                                    {activeDropdown === 'sort' && (
                                        <div className="absolute top-full right-0 mt-2 w-40 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                            {SORTS.map(s => (
                                                <div key={s.value} onClick={() => handleFilterChange('sort', s.value)} className={cn("px-4 py-2 hover:bg-white/5 cursor-pointer text-sm font-medium transition-colors", filters.sort === s.value ? "text-primary bg-primary/5" : "text-text-secondary")}>
                                                    {s.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-primary" size={40} />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {movies.map((movie) => (
                                        <MovieCard key={movie.id} {...movie} />
                                    ))}
                                </div>

                                {movies.length > 0 && (
                                    <div className="flex justify-center mt-12 gap-4 pb-10">
                                        <button
                                            disabled={filters.page <= 1}
                                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                            className="px-8 py-3 bg-card border border-white/5 rounded-xl text-white font-bold disabled:opacity-30 hover:bg-card-hover transition-all active:scale-95"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center px-4 font-bold text-text-secondary">
                                            Page {filters.page}
                                        </div>
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                            className="px-8 py-3 bg-card border border-white/5 rounded-xl text-white font-bold hover:bg-card-hover transition-all active:scale-95"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </section>
        </div>
    )
}
