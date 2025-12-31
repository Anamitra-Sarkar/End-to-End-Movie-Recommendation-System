/** @type {import('next').NextConfig} */
const nextConfig = {
    // Rewrites removed - frontend now points directly to Hugging Face backend
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
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            }
        ],
    },
}

export default nextConfig
