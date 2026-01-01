import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    onSnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface WatchlistMovie {
    id: number;
    title: string;
    poster: string;
    rating?: number;
    genre?: string;
    year?: number;
    addedAt: Date;
}

export async function addToWatchlist(userId: string, movie: Omit<WatchlistMovie, 'addedAt'>) {
    if (!db) throw new Error('Firestore not initialized');
    
    // Use movie ID as document ID (assumes numeric movie IDs from TMDB API)
    const docRef = doc(db, 'users', userId, 'watchlist', String(movie.id));
    await setDoc(docRef, {
        ...movie,
        addedAt: new Date(),
    });
}

export async function removeFromWatchlist(userId: string, movieId: number) {
    if (!db) throw new Error('Firestore not initialized');
    
    const docRef = doc(db, 'users', userId, 'watchlist', String(movieId));
    await deleteDoc(docRef);
}

export async function getWatchlist(userId: string): Promise<WatchlistMovie[]> {
    if (!db) throw new Error('Firestore not initialized');
    
    const watchlistRef = collection(db, 'users', userId, 'watchlist');
    const q = query(watchlistRef, orderBy('addedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    // Convert document ID back to numeric movie ID (TMDB uses numeric IDs)
    return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: parseInt(doc.id, 10),
        addedAt: doc.data().addedAt?.toDate() || new Date(),
    })) as WatchlistMovie[];
}

export async function isInWatchlist(userId: string, movieId: number): Promise<boolean> {
    if (!db) throw new Error('Firestore not initialized');
    
    const docRef = doc(db, 'users', userId, 'watchlist', String(movieId));
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}

// Real-time listener for watchlist updates
export function subscribeToWatchlist(
    userId: string,
    callback: (movies: WatchlistMovie[]) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    if (!db) {
        const error = new Error('Firestore not initialized');
        if (onError) onError(error);
        return () => {};
    }
    
    const watchlistRef = collection(db, 'users', userId, 'watchlist');
    const q = query(watchlistRef, orderBy('addedAt', 'desc'));
    
    return onSnapshot(
        q,
        (snapshot) => {
            // Convert document ID back to numeric movie ID (TMDB uses numeric IDs)
            const movies = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: parseInt(doc.id, 10),
                addedAt: doc.data().addedAt?.toDate() || new Date(),
            })) as WatchlistMovie[];
            callback(movies);
        },
        (error) => {
            console.error('Watchlist subscription error:', error);
            if (onError) onError(error);
        }
    );
}
