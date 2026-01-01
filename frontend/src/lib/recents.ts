import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    orderBy,
    limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface RecentMovie {
    id: number;
    title: string;
    poster: string;
    rating?: number;
    genre?: string;
    year?: number;
    viewedAt: Date;
}

const MAX_RECENTS = 20;

// Add a movie to recents (Firestore or localStorage)
export async function addToRecents(userId: string | null, movie: Omit<RecentMovie, 'viewedAt'>) {
    const movieData = {
        ...movie,
        viewedAt: new Date(),
    };

    if (userId && db) {
        try {
            const docRef = doc(db, 'users', userId, 'recents', String(movie.id));
            await setDoc(docRef, movieData);
        } catch (error) {
            console.error('Failed to save recent to Firestore:', error);
            // Fallback to localStorage
            addToLocalRecents(movie);
        }
    } else {
        addToLocalRecents(movie);
    }
}

// Get recents from Firestore or localStorage
export async function getRecents(userId: string | null): Promise<RecentMovie[]> {
    if (userId && db) {
        try {
            const recentsRef = collection(db, 'users', userId, 'recents');
            const q = query(recentsRef, orderBy('viewedAt', 'desc'), limit(MAX_RECENTS));
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: parseInt(doc.id, 10),
                viewedAt: doc.data().viewedAt?.toDate() || new Date(),
            })) as RecentMovie[];
        } catch (error) {
            console.error('Failed to fetch recents from Firestore:', error);
            return getLocalRecents();
        }
    }
    
    return getLocalRecents();
}

// localStorage helpers
function addToLocalRecents(movie: Omit<RecentMovie, 'viewedAt'>) {
    if (typeof window === 'undefined') return;
    
    const recents = getLocalRecents();
    
    // Remove existing entry if present
    const filtered = recents.filter(m => m.id !== movie.id);
    
    // Add to front
    const updated: RecentMovie[] = [
        { ...movie, viewedAt: new Date() },
        ...filtered,
    ].slice(0, MAX_RECENTS);
    
    localStorage.setItem('recent_views', JSON.stringify(updated));
}

function getLocalRecents(): RecentMovie[] {
    if (typeof window === 'undefined') return [];
    
    try {
        const stored = localStorage.getItem('recent_views');
        if (!stored) return [];
        
        const parsed = JSON.parse(stored);
        return parsed.map((m: RecentMovie) => ({
            ...m,
            viewedAt: new Date(m.viewedAt),
        }));
    } catch {
        return [];
    }
}

// Get the last viewed movie (for recommendations)
export async function getLastViewed(userId: string | null): Promise<RecentMovie | null> {
    const recents = await getRecents(userId);
    return recents.length > 0 ? recents[0] : null;
}
