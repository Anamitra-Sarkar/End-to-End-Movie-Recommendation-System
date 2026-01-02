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
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';

export interface CommunityPost {
  id?: string;
  userId: string;
  user: string;
  avatar: string;
  movie?: string;
  rating?: number;
  content: string;
  likes: number;
  replies: number;
  createdAt: Date | Timestamp;
}

/**
 * Subscribe to real-time community posts
 * - Waits for auth to be ready
 * - Uses correct Firestore path
 * - Safe against permission errors
 */
export function subscribeToCommunityPosts(
  callback: (posts: CommunityPost[]) => void,
  onError?: (error: Error) => void,
  maxPosts: number = 50
): Unsubscribe {
  if (!db || !auth) {
    const error = new Error('Firebase not initialized');
    onError?.(error);
    return () => {};
  }

  let unsubscribe: Unsubscribe = () => {};

  const stopAuthListener = onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const postsRef = collection(db, 'community_posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(maxPosts));

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const posts: CommunityPost[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          const createdAt =
            data.createdAt?.toDate?.() ??
            (data.createdAt ? new Date(data.createdAt) : new Date());

          return {
            id: doc.id,
            userId: data.userId,
            user: data.user || 'Anonymous',
            avatar: data.avatar || '🎬',
            movie: data.movie,
            rating: typeof data.rating === 'number' ? data.rating : undefined,
            content: data.content || '',
            likes: data.likes ?? 0,
            replies: data.replies ?? 0,
            createdAt,
          };
        });

        callback(posts);
      },
      (error) => {
        console.error('Community posts subscription error:', error);
        onError?.(error);
      }
    );

    stopAuthListener();
  });

  return () => {
    unsubscribe();
    stopAuthListener();
  };
}

/**
 * Add a new community post
 * - Requires authenticated user
 * - Matches Firestore security rules
 */
export async function addCommunityPost(
  post: Omit<CommunityPost, 'id' | 'likes' | 'replies' | 'createdAt'>
) {
  if (!db || !auth) throw new Error('Firebase not initialized');

  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const postsRef = collection(db, 'community_posts');

  const newPost = {
    ...post,
    userId: user.uid,
    likes: 0,
    replies: 0,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(postsRef, newPost);
  return docRef.id;
}
