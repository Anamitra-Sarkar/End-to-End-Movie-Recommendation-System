/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*', // Use localhost consistently
            },
            {
                source: '/recommend',
                destination: 'http://localhost:5000/recommend',
            }
        ]
    },
    // Ensure we don't have issues with large posters
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            }
        ],
    },
}

export default nextConfig
