import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Add an ad to user's favorites
 */
export async function addToFavorites(userId: string, adId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    favorites: arrayUnion(adId)
  });
}

/**
 * Remove an ad from user's favorites
 */
export async function removeFromFavorites(userId: string, adId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    favorites: arrayRemove(adId)
  });
}

/**
 * Toggle favorite status for an ad
 */
export async function toggleFavorite(userId: string, adId: string, isFavorite: boolean): Promise<void> {
  if (isFavorite) {
    await removeFromFavorites(userId, adId);
  } else {
    await addToFavorites(userId, adId);
  }
}

/**
 * Check if an ad is in user's favorites
 */
export async function isFavorite(userId: string, adId: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return false;
  
  const favorites = userSnap.data().favorites || [];
  return favorites.includes(adId);
}

/**
 * Get user's favorite ad IDs
 */
export async function getFavorites(userId: string): Promise<string[]> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return [];
  
  return userSnap.data().favorites || [];
}
