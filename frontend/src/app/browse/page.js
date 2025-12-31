"use client";

import React from 'react'
import MovieDashboard from '@/components/MovieDashboard'

export default function BrowsePage() {
    return (
        <MovieDashboard
            title="Browse Catalog"
            mode="grid"
            enableSearch={true}
        />
    )
}
