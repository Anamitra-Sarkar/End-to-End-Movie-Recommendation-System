import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, LayoutGrid, List, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MovieCard from '../components/MovieCard'
import { getSuggestions, getRecommendations } from '../services/api'

const Home = () => {
    const [viewMode, setViewMode] = useState('grid')
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [filteredSuggestions, setFilteredSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState(null)

    // Dummy Data for Initial View
    const dummyMovies = [
        { id: 1, title: "Dune: Part Two", rating: "8.4", year: "2024", genre: "Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
        { id: 2, title: "Oppenheimer", rating: "8.9", year: "2023", genre: "Biography", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
        { id: 3, title: "Spider-Man: Across the Spider-Verse", rating: "9.0", year: "2023", genre: "Animation", poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg" },
        { id: 4, title: "Blade Runner 2049", rating: "8.0", year: "2017", genre: "Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" },
        { id: 5, title: "Interstellar", rating: "8.7", year: "2014", genre: "Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/gEU2QniL6E8AHtMY4kRFWNz03jp.jpg" },
    ]

    useEffect(() => {
        // Fetch all suggestions once on mount
        const fetchSuggestions = async () => {
            const allSuggestions = await getSuggestions()
            setSuggestions(allSuggestions)
        }
        fetchSuggestions()
    }, [])

    useEffect(() => {
        if (query.length > 1) {
            const filtered = suggestions.filter(s =>
                s && s.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8)
            setFilteredSuggestions(filtered)
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
        }
    }, [query, suggestions])

    const handleSearch = async (searchQuery) => {
        if (!searchQuery) return
        setQuery(searchQuery)
        setShowSuggestions(false)
        setIsLoading(true)
        setError(null)
        setResults(null)

        try {
            const data = await getRecommendations(searchQuery)
            if (data.error) {
                setError(data.error)
            } else {
                // Zip movies and posters
                const formattedResults = data.movies.map((title, index) => ({
                    id: index,
                    title: title,
                    poster: data.posters[index],
                    rating: "N/A", // API doesn't return rating
                    year: "N/A", // API doesn't return year
                    genre: "Recommendation"
                }))
                setResults({ query: data.query, movies: formattedResults })
            }
        } catch (err) {
            setError("Failed to fetch recommendations. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const currentMovies = results ? results.movies : dummyMovies
    const sectionTitle = results ? `Results for "${results.query}"` : "Trending Now"

    return (
        <div className="min-h-full pb-20">
            {/* Hero Section */}
            <section className="relative pt-32 pb-10 px-8">
                <div className="max-w-4xl mx-auto text-center z-10 relative">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold mb-6"
                    >
                        Explore the <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Cinematic Universe</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Dive into our extensive library of award-winning movies, hidden gems, and trending hits curated just for you.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative max-w-xl mx-auto w-full group z-50"
                    >
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-text-secondary group-focus-within:text-primary transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                                className="block w-full pl-12 pr-28 py-4 rounded-2xl bg-card border border-white/5 focus:border-primary/50 ring-0 focus:ring-4 focus:ring-primary/10 text-white placeholder-text-secondary transition-all outline-none"
                                placeholder="Search for titles, genres, or directors..."
                            />
                            <button
                                onClick={() => handleSearch(query)}
                                className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-white px-6 rounded-xl font-semibold transition-transform active:scale-95 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Search"}
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto custom-scrollbar"
                                >
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSearch(suggestion)}
                                            className="px-4 py-3 hover:bg-white/5 cursor-pointer text-text-secondary hover:text-white transition-colors flex items-center gap-3"
                                        >
                                            <Search size={14} className="opacity-50" />
                                            {suggestion}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[120px] -z-10" />
            </section>

            {/* Filters */}
            <section className="px-8 mt-8 mb-12">
                <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {['Sort: Popularity', 'Genre: All', 'Year: Any', 'Rating: 7+'].map((filter, i) => (
                            <button key={i} className="flex items-center gap-2 px-4 py-2 bg-card border border-white/5 rounded-full text-sm text-text-secondary hover:text-white hover:border-white/10 transition-colors whitespace-nowrap">
                                {filter}
                                <span className="opacity-50">▼</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-card rounded-lg border border-white/5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Movie Grid */}
            <section className="px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6 border-l-4 border-primary pl-4">
                    <h2 className="text-2xl font-bold text-white">{sectionTitle}</h2>
                    {!results && <button className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors">See All</button>}
                </div>

                {error ? (
                    <div className="text-center py-20 text-red-400 bg-red-400/10 rounded-2xl border border-red-400/20">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {currentMovies.map((movie) => (
                            <MovieCard key={movie.id} {...movie} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Home
