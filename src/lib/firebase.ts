import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  Firestore,
} from 'firebase/firestore';
import { NodeData } from '../types';

// Environment variable config with seamless fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyNodefolioCommunityEasterEggKey2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'nodefolio-research-easteregg.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'nodefolio-research-easteregg',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'nodefolio-research-easteregg.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '894210375621',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:894210375621:web:7c9e120fbd4510ba9e2',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isFirestoreInitialized = false;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirestoreInitialized = true;
} catch (err) {
  console.warn('[Firebase] Initialized in resilient offline mode:', err);
}

export const VISITOR_NODES_COLLECTION = 'visitor_nodes';
const LOCAL_STORAGE_KEY = 'nodefolio_visitor_notes';

/**
 * Clean serialization of a NodeData instance for Firestore storage
 */
const serializeNodeForFirestore = (node: NodeData) => {
  return {
    id: String(node.id),
    title: String(node.title || ''),
    subtitle: String(node.subtitle || ''),
    category: 'visitor',
    shape: node.shape || 'square',
    x: typeof node.x === 'number' && isFinite(node.x) ? node.x : 1450,
    y: typeof node.y === 'number' && isFinite(node.y) ? node.y : 450,
    width: typeof node.width === 'number' && isFinite(node.width) ? node.width : 270,
    accentColor: node.accentColor || '#f43f5e',
    glowColor: node.glowColor || 'rgba(244, 63, 94, 0.2)',
    visitorData: node.visitorData
      ? {
          id: String(node.visitorData.id),
          name: String(node.visitorData.name || 'Anonymous Researcher'),
          message: String(node.visitorData.message || ''),
          category: node.visitorData.category || 'note',
          shape: node.visitorData.shape || 'square',
          accent: node.visitorData.accent || 'crimson',
          createdAt: typeof node.visitorData.createdAt === 'number' ? node.visitorData.createdAt : Date.now(),
          approved: true,
        }
      : null,
    updatedAt: Date.now(),
  };
};

/**
 * Real-time subscription to community visitor nodes across all connected users
 */
export const subscribeToCommunityVisitorNodes = (
  onNodesUpdated: (nodes: NodeData[]) => void
): (() => void) => {
  if (!db || !isFirestoreInitialized) {
    return () => {};
  }

  try {
    const colRef = collection(db, VISITOR_NODES_COLLECTION);
    const q = query(colRef, limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreNodes: NodeData[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data || !data.id) return;

          const node: NodeData = {
            id: String(data.id),
            title: String(data.title || 'Research Note'),
            subtitle: String(data.subtitle || 'COMMUNITY NOTE'),
            category: 'visitor',
            shape: data.shape || 'square',
            x: typeof data.x === 'number' && isFinite(data.x) ? data.x : 1450,
            y: typeof data.y === 'number' && isFinite(data.y) ? data.y : 450,
            width: typeof data.width === 'number' && isFinite(data.width) ? data.width : 270,
            inputs: [],
            outputs: [],
            accentColor: data.accentColor || '#f43f5e',
            glowColor: data.glowColor || 'rgba(244, 63, 94, 0.2)',
            visitorData: data.visitorData || undefined,
          };
          firestoreNodes.push(node);
        });

        // Always mirror received community nodes to local storage as fallback cache
        if (firestoreNodes.length > 0) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(firestoreNodes));
          } catch (e) {
            // Ignore storage write errors
          }
        }

        onNodesUpdated(firestoreNodes);
      },
      (error) => {
        // Silently handle offline/permission errors and preserve local experience
        console.info('[Firestore] Real-time synchronization fallback active:', error.message);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.info('[Firestore] Subscription bypassed:', err);
    return () => {};
  }
};

/**
 * Persists a visitor note both to Firestore in real-time and to localStorage
 */
export const saveCommunityVisitorNode = async (node: NodeData): Promise<void> => {
  // 1. Immediately persist locally
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: NodeData[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = existing.filter((n) => n.id !== node.id);
    filtered.push(node);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Local storage save error:', e);
  }

  // 2. Broadcast to Firestore if initialized
  if (!db || !isFirestoreInitialized) return;

  try {
    const docRef = doc(db, VISITOR_NODES_COLLECTION, node.id);
    const payload = serializeNodeForFirestore(node);
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Failed to push node to cloud backend:', err);
  }
};

/**
 * Deletes a community visitor node from Firestore and local cache
 */
export const deleteCommunityVisitorNode = async (nodeId: string): Promise<void> => {
  // 1. Update local cache
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existingRaw) {
      const existing: NodeData[] = JSON.parse(existingRaw);
      const filtered = existing.filter((n) => n.id !== nodeId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Local storage delete error:', e);
  }

  // 2. Remove from Firestore
  if (!db || !isFirestoreInitialized) return;

  try {
    const docRef = doc(db, VISITOR_NODES_COLLECTION, nodeId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Firestore] Failed to delete node from cloud backend:', err);
  }
};
