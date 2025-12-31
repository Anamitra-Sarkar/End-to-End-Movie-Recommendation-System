"use client";

import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'
import { getMovies } from '@/services/api'

// Default mock movies for fallback
const DEFAULT_MOCK = [
    { id: 550, title: "Fight Club", poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", rating: 8.4, genre: "Drama", year: 1999 },
    { id: 157336, title: "Interstellar", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", rating: 8.6, genre: "Sci-Fi", year: 2014 },
    { id: 27205, title: "Inception", poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", rating: 8.4, genre: "Action", year: 2010 },
    { id: 155, title: "The Dark Knight", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", rating: 9.0, genre: "Action", year: 2008 },
    { id: 19995, title: "Avatar", poster: "https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs3YNrtfwfhTL.jpg", rating: 7.6, genre: "Action", year: 2009 },
    { id: 680, title: "Pulp Fiction", poster: "https://image.tmdb.org/t/p/w500/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg", rating: 8.5, genre: "Crime", year: 1994 },
];

export default function MovieRow({ title, params, mockData }) {
    const [movies, setMovies] = useState([])
    const rowRef = useRef(null)

    useEffect(() => {
        getMovies({ ...params, limit: 15 }).then(data => {
            if (data.movies && data.movies.length > 0) {
                setMovies(data.movies)
            } else {
                setMovies(mockData || DEFAULT_MOCK);
            }
        }).catch(err => {
            console.error(`MovieRow [${title}] failed:`, err);
            setMovies(mockData || DEFAULT_MOCK);
        })
    }, [title])

    const scroll = (direction) => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    }

    if (movies.length === 0) return null;

    return (
        <div className="mb-8 group/row">
            <h2 className="text-xl font-bold text-white mb-4 px-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                {title}
            </h2>

            <div className="relative group/slider">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center z-20 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 backdrop-blur-sm cursor-pointer rounded-l-xl"
                >
                    <ChevronLeft className="text-white" size={32} />
                </button>

                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto px-2 pb-4 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie, index) => (
                        <div key={movie.id || index} className="w-[160px] md:w-[200px] flex-shrink-0">
                            <MovieCard {...movie} />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center z-20 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 backdrop-blur-sm cursor-pointer rounded-r-xl"
                >
                    <ChevronRight className="text-white" size={32} />
                </button>
            </div>
        </div>
    )
}
