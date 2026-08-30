import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  updateDoc,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Artwork, TicketType, MuseumEvent, BookedTicket, UserProfile, AccountType, GuestbookReview } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);

/**
 * Firestore rejects any field whose value is `undefined` (e.g. adminTitle: undefined
 * for non-admin users). This strips those keys out before writes so setDoc/updateDoc
 * never throws "Unsupported field value: undefined".
 */
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean as T;
}

// Collection References
export const artworksCol = collection(db, 'artworks');
export const ticketTypesCol = collection(db, 'ticketTypes');
export const eventsCol = collection(db, 'events');
export const bookedTicketsCol = collection(db, 'bookedTickets');
export const usersCol = collection(db, 'users');
export const guestbookReviewsCol = collection(db, 'guestbookReviews');

/**
 * Automatically seeds the Firestore database if collections are currently empty.
 */
export async function seedFirestoreIfEmpty(
  defaultArtworks: Artwork[],
  defaultTicketTypes: TicketType[],
  defaultEvents: MuseumEvent[],
  defaultTickets: BookedTicket[],
  defaultReviews?: GuestbookReview[]
) {
  try {
    const artworksSnap = await getDocs(artworksCol);
    if (artworksSnap.empty) {
      console.log('Seeding initial artworks to Firestore...');
      const batch = writeBatch(db);
      defaultArtworks.forEach((artwork) => {
        const ref = doc(db, 'artworks', artwork.id);
        batch.set(ref, artwork);
      });
      await batch.commit();
    }

    const ticketTypesSnap = await getDocs(ticketTypesCol);
    if (ticketTypesSnap.empty) {
      console.log('Seeding initial ticket types to Firestore...');
      const batch = writeBatch(db);
      defaultTicketTypes.forEach((type) => {
        const ref = doc(db, 'ticketTypes', type.id);
        batch.set(ref, type);
      });
      await batch.commit();
    }

    const eventsSnap = await getDocs(eventsCol);
    if (eventsSnap.empty) {
      console.log('Seeding initial events to Firestore...');
      const batch = writeBatch(db);
      defaultEvents.forEach((evt) => {
        const ref = doc(db, 'events', evt.id);
        batch.set(ref, evt);
      });
      await batch.commit();
    }

    const ticketsSnap = await getDocs(bookedTicketsCol);
    if (ticketsSnap.empty && defaultTickets.length > 0) {
      console.log('Seeding initial booked tickets to Firestore...');
      const batch = writeBatch(db);
      defaultTickets.forEach((t) => {
        const ref = doc(db, 'bookedTickets', t.ticketId);
        batch.set(ref, t);
      });
      await batch.commit();
    }

    if (defaultReviews && defaultReviews.length > 0) {
      const reviewsSnap = await getDocs(guestbookReviewsCol);
      if (reviewsSnap.empty) {
        console.log('Seeding initial guestbook reviews to Firestore...');
        const batch = writeBatch(db);
        defaultReviews.forEach((rev) => {
          const ref = doc(db, 'guestbookReviews', rev.id);
          batch.set(ref, rev);
        });
        await batch.commit();
      }
    }
  } catch (error) {
    console.error('Error seeding Firestore initial data:', error);
  }
}

/**
 * Real-time listener for Artworks
 */
export function subscribeArtworks(callback: (artworks: Artwork[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(artworksCol, (snapshot) => {
    const items: Artwork[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Artwork);
    });
    callback(items);
  }, (err) => {
    console.error('Artworks subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Real-time listener for Ticket Types
 */
export function subscribeTicketTypes(callback: (ticketTypes: TicketType[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(ticketTypesCol, (snapshot) => {
    const items: TicketType[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as TicketType);
    });
    callback(items);
  }, (err) => {
    console.error('Ticket types subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Real-time listener for Museum Events
 */
export function subscribeEvents(callback: (events: MuseumEvent[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(eventsCol, (snapshot) => {
    const items: MuseumEvent[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as MuseumEvent);
    });
    callback(items);
  }, (err) => {
    console.error('Events subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Real-time listener for Booked Tickets
 */
export function subscribeBookedTickets(callback: (tickets: BookedTicket[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(bookedTicketsCol, (snapshot) => {
    const items: BookedTicket[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ticketId: docSnap.id, ...docSnap.data() } as BookedTicket);
    });
    callback(items);
  }, (err) => {
    console.error('Booked tickets subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Real-time listener for Guestbook Reviews (Livre d'or)
 */
export function subscribeGuestbookReviews(callback: (reviews: GuestbookReview[]) => void, onError?: (error: Error) => void) {
  const q = query(guestbookReviewsCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items: GuestbookReview[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as GuestbookReview);
    });
    callback(items);
  }, (err) => {
    console.error('Guestbook reviews subscription error:', err);
    // Fallback without ordering in case index is pending
    onSnapshot(guestbookReviewsCol, (snapshot) => {
      const items: GuestbookReview[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as GuestbookReview);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    }, (e) => {
      if (onError) onError(e);
    });
  });
}

// ----------------- CRUD Operations -----------------

// Guestbook Reviews (Livre d'or)
export async function saveGuestbookReviewToFirestore(review: GuestbookReview): Promise<void> {
  const ref = doc(db, 'guestbookReviews', review.id);
  await setDoc(ref, review, { merge: true });
}

export async function deleteGuestbookReviewFromFirestore(reviewId: string): Promise<void> {
  const ref = doc(db, 'guestbookReviews', reviewId);
  await deleteDoc(ref);
}

export async function toggleLikeGuestbookReviewInFirestore(reviewId: string, userId: string): Promise<void> {
  const ref = doc(db, 'guestbookReviews', reviewId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as GuestbookReview;
    const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
    const hasLiked = likedBy.includes(userId);
    const updatedLikedBy = hasLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId];
    const newCount = Math.max(0, updatedLikedBy.length);
    await updateDoc(ref, {
      likedBy: updatedLikedBy,
      likesCount: newCount
    });
  }
}

export async function addAdminReplyToGuestbookReview(
  reviewId: string, 
  reply: { author: string; message: string; date: string }
): Promise<void> {
  const ref = doc(db, 'guestbookReviews', reviewId);
  await updateDoc(ref, {
    adminResponse: reply
  });
}


// Artworks
export async function saveArtworkToFirestore(artwork: Artwork): Promise<void> {
  const ref = doc(db, 'artworks', artwork.id);
  await setDoc(ref, artwork, { merge: true });
}

export async function deleteArtworkFromFirestore(artworkId: string): Promise<void> {
  const ref = doc(db, 'artworks', artworkId);
  await deleteDoc(ref);
}

// Ticket Types
export async function saveTicketTypeToFirestore(ticketType: TicketType): Promise<void> {
  const ref = doc(db, 'ticketTypes', ticketType.id);
  await setDoc(ref, ticketType, { merge: true });
}

export async function updateTicketTypeInFirestore(typeId: string, updates: Partial<TicketType>): Promise<void> {
  const ref = doc(db, 'ticketTypes', typeId);
  await updateDoc(ref, updates);
}

export async function deleteTicketTypeFromFirestore(ticketTypeId: string): Promise<void> {
  const ref = doc(db, 'ticketTypes', ticketTypeId);
  await deleteDoc(ref);
}

// Events
export async function saveEventToFirestore(event: MuseumEvent): Promise<void> {
  const ref = doc(db, 'events', event.id);
  await setDoc(ref, event, { merge: true });
}

export async function deleteEventFromFirestore(eventId: string): Promise<void> {
  const ref = doc(db, 'events', eventId);
  await deleteDoc(ref);
}

// Tickets
export async function saveBookedTicketToFirestore(ticket: BookedTicket): Promise<void> {
  const ref = doc(db, 'bookedTickets', ticket.ticketId);
  await setDoc(ref, ticket, { merge: true });
}

export async function validateTicketInFirestore(ticketId: string, status: 'valid' | 'used' | 'cancelled', validatedAt?: string): Promise<void> {
  const ref = doc(db, 'bookedTickets', ticketId);
  await updateDoc(ref, {
    status,
    validatedAt: validatedAt || null
  });
}

// Full reset to default dataset
export async function resetFirestoreToDefaults(
  defaultArtworks: Artwork[],
  defaultTicketTypes: TicketType[],
  defaultEvents: MuseumEvent[]
): Promise<void> {
  // Clear artworks
  const arts = await getDocs(artworksCol);
  const batch1 = writeBatch(db);
  arts.forEach(d => batch1.delete(d.ref));
  await batch1.commit();

  // Clear ticket types
  const types = await getDocs(ticketTypesCol);
  const batch2 = writeBatch(db);
  types.forEach(d => batch2.delete(d.ref));
  await batch2.commit();

  // Clear events
  const evts = await getDocs(eventsCol);
  const batch3 = writeBatch(db);
  evts.forEach(d => batch3.delete(d.ref));
  await batch3.commit();

  // Re-seed defaults
  const batch4 = writeBatch(db);
  defaultArtworks.forEach(a => batch4.set(doc(db, 'artworks', a.id), a));
  defaultTicketTypes.forEach(t => batch4.set(doc(db, 'ticketTypes', t.id), t));
  defaultEvents.forEach(e => batch4.set(doc(db, 'events', e.id), e));
  await batch4.commit();
}

// ----------------- Firebase Auth Operations -----------------

/**
 * Register a new user in Firebase Auth and create their profile in Firestore.
 */
export async function signUpWithFirebase(
  email: string,
  pass: string,
  profileData: Omit<UserProfile, 'id'>
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = userCredential.user;

  const userProfile: UserProfile = {
    id: fbUser.uid,
    email: fbUser.email || email,
    name: profileData.name,
    accountType: profileData.accountType,
    role: profileData.role,
    adminRole: profileData.adminRole,
    adminTitle: profileData.adminTitle,
    avatar: profileData.avatar,
    favorites: profileData.favorites || [],
    bookedTickets: profileData.bookedTickets || [],
    country: profileData.country || 'Sénégal',
    createdAt: new Date().toISOString()
  };

  // Save to Firestore
  await setDoc(doc(db, 'users', fbUser.uid), stripUndefined(userProfile));
  return userProfile;
}

/**
 * Sign in existing user with Firebase Auth and retrieve/upsert their Firestore profile.
 */
export async function signInWithFirebase(email: string, pass: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = userCredential.user;

  // Retrieve user document from Firestore
  const userDocRef = doc(db, 'users', fbUser.uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  } else {
    // Generate fallback profile if first time or synced
    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('mcn.sn') || email.toLowerCase().includes('direction');
    const newProfile: UserProfile = {
      id: fbUser.uid,
      email: fbUser.email || email,
      name: fbUser.displayName || email.split('@')[0],
      accountType: isAdmin ? 'admin' : 'visitor',
      role: isAdmin ? 'conservateur_general' : 'visiteur_local',
      adminTitle: isAdmin ? 'Conservateur' : undefined,
      favorites: ['mcn-art-01', 'mcn-art-02'],
      bookedTickets: [],
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, stripUndefined(newProfile));
    return newProfile;
  }
}

// Google Auth Provider setup with account selection prompt
const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with Google using native popup (shows account selection on device)
 * and synchronizes user profile with Firestore.
 */
export async function signInWithGooglePopup(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleAuthProvider);
  const fbUser = result.user;

  const userDocRef = doc(db, 'users', fbUser.uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const existing = userSnap.data() as UserProfile;
    // Update name or avatar if not set
    if (!existing.avatar && fbUser.photoURL) {
      await updateDoc(userDocRef, { avatar: fbUser.photoURL });
    }
    return { ...existing, id: fbUser.uid };
  } else {
    const userEmail = (fbUser.email || '').toLowerCase();
    const isAdmin = userEmail.includes('admin') || userEmail.includes('direction') || userEmail.includes('conservateur');
    
    const newProfile: UserProfile = {
      id: fbUser.uid,
      email: userEmail,
      name: fbUser.displayName || (userEmail ? userEmail.split('@')[0] : 'Visiteur MCN'),
      avatar: fbUser.photoURL || undefined,
      accountType: isAdmin ? 'admin' : 'visitor',
      role: isAdmin ? 'conservateur_general' : 'visiteur_local',
      adminTitle: isAdmin ? 'Conservateur en Chef' : undefined,
      country: 'Sénégal',
      favorites: ['mcn-art-01', 'mcn-art-02'],
      bookedTickets: [],
      createdAt: new Date().toISOString()
    };

    await setDoc(userDocRef, stripUndefined(newProfile));
    return newProfile;
  }
}

/**
 * Real-time listener for current user's profile in Firestore
 * If an admin edits the user in Firebase (e.g. changing accountType to 'admin'),
 * the app updates immediately in real-time.
 */
export function subscribeUserProfile(userId: string, callback: (user: UserProfile) => void, onError?: (error: Error) => void) {
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(userDocRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      callback({ ...data, id: snap.id });
    }
  }, (err) => {
    console.error('User profile subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Sign out current user from Firebase Auth
 */
export async function signOutFromFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfileInFirestore(userId: string, data: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, stripUndefined(data), { merge: true });
}

