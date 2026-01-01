import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';

// GET: Fetch all posts
export async function GET() {
    try {
        await connectToDatabase();
        const posts = await Post.find({}).sort({ createdAt: -1 }).limit(50);
        return NextResponse.json({ posts }, { status: 200 });
    } catch (error) {
        console.error('Error fetching posts:', error);
        // Return empty array if MongoDB is not configured
        return NextResponse.json({ posts: [], error: 'Database not configured' }, { status: 200 });
    }
}

// POST: Create a new post
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        
        const body = await request.json();
        const { user, content, movie, rating, avatar } = body;

        if (!user || !content) {
            return NextResponse.json(
                { error: 'User and content are required' },
                { status: 400 }
            );
        }

        const post = await Post.create({
            user,
            content,
            movie,
            rating,
            avatar: avatar || '🎬',
            likes: 0,
            replies: 0,
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Failed to create post. Database may not be configured.' },
            { status: 500 }
        );
    }
}
