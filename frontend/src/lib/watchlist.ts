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
    const docRef = doc(db, 'users', userId, 'watchlist', String(movie.id));
    await setDoc(docRef, {
        ...movie,
        addedAt: new Date(),
    });
}

export async function removeFromWatchlist(userId: string, movieId: number) {
    const docRef = doc(db, 'users', userId, 'watchlist', String(movieId));
    await deleteDoc(docRef);
}

export async function getWatchlist(userId: string): Promise<WatchlistMovie[]> {
    const watchlistRef = collection(db, 'users', userId, 'watchlist');
    const q = query(watchlistRef, orderBy('addedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: parseInt(doc.id, 10),
        addedAt: doc.data().addedAt?.toDate() || new Date(),
    })) as WatchlistMovie[];
}

export async function isInWatchlist(userId: string, movieId: number): Promise<boolean> {
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
    const watchlistRef = collection(db, 'users', userId, 'watchlist');
    const q = query(watchlistRef, orderBy('addedAt', 'desc'));
    
    return onSnapshot(
        q,
        (snapshot) => {
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
