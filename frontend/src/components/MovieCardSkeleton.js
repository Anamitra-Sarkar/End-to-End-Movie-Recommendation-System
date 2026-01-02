"use client";

import React from 'react'

const MovieCardSkeleton = () => {
    return (
        <div className="relative rounded-xl overflow-hidden bg-card border border-white/5 shadow-2xl aspect-[2/3] animate-pulse">
            {/* Skeleton for poster */}
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            
            {/* Skeleton for rating badge */}
            <div className="absolute top-2 left-2 z-10">
                <div className="bg-gray-700 px-2 py-1 rounded-md w-12 h-5" />
            </div>
            
            {/* Skeleton for watchlist button */}
            <div className="absolute top-2 right-2 z-20">
                <div className="bg-gray-700 rounded-xl w-10 h-10" />
            </div>
            
            {/* Skeleton for content */}
            <div className="absolute bottom-0 left-0 w-full p-4">
                <div className="bg-gray-700 h-4 w-3/4 mb-2 rounded" />
                <div className="bg-gray-700 h-3 w-1/2 rounded" />
            </div>
        </div>
    )
}

export default MovieCardSkeleton
