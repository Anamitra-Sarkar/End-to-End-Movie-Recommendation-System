import React from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

const MovieCard = ({ title, poster, rating, genre, year }) => {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative group rounded-3xl overflow-hidden cursor-pointer bg-card aspect-[2/3]"
        >
            <img src={poster} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{rating || "N/A"}</span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 p-4 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{title}</h3>
                <div className="flex items-center gap-2 text-xs text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                    <span>{genre || "Movie"}</span>
                    <span>•</span>
                    <span>{year || "2024"}</span>
                </div>
            </div>
        </motion.div>
    )
}

export default MovieCard
