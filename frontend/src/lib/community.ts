import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    Unsubscribe,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CommunityPost {
    id?: string;
    user: string;
    avatar: string;
    movie?: string;
    rating?: number;
    content: string;
    likes: number;
    replies: number;
    createdAt: Date | Timestamp;
}

// Subscribe to real-time community posts
export function subscribeToCommunityPosts(
    callback: (posts: CommunityPost[]) => void,
    onError?: (error: Error) => void,
    maxPosts: number = 50
): Unsubscribe {
    if (!db) {
        const error = new Error('Firestore not initialized');
        if (onError) onError(error);
        return () => {};
    }
    
    const postsRef = collection(db, 'public', 'data', 'community_posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(maxPosts));
    
    return onSnapshot(
        q,
        (snapshot) => {
            const posts = snapshot.docs.map((doc) => {
                const data = doc.data();
                let createdAt: Date;
                
                // Safely handle createdAt conversion
                if (data.createdAt?.toDate) {
                    createdAt = data.createdAt.toDate();
                } else if (data.createdAt) {
                    const parsed = new Date(data.createdAt);
                    createdAt = isNaN(parsed.getTime()) ? new Date() : parsed;
                } else {
                    createdAt = new Date();
                }
                
                return {
                    id: doc.id,
                    user: data.user || 'Anonymous',
                    avatar: data.avatar || '🎬',
                    movie: data.movie,
                    rating: data.rating,
                    content: data.content || '',
                    likes: data.likes || 0,
                    replies: data.replies || 0,
                    createdAt,
                } as CommunityPost;
            });
            callback(posts);
        },
        (error) => {
            console.error('Community posts subscription error:', error);
            if (onError) onError(error);
        }
    );
}

// Add a new community post
export async function addCommunityPost(post: Omit<CommunityPost, 'id' | 'likes' | 'replies' | 'createdAt'>) {
    if (!db) throw new Error('Firestore not initialized');
    
    const postsRef = collection(db, 'public', 'data', 'community_posts');
    
    const newPost = {
        ...post,
        likes: 0,
        replies: 0,
        createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(postsRef, newPost);
    return docRef.id;
}
