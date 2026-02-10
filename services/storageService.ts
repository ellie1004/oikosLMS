
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

// User's Firebase Configuration from Screenshot
const firebaseConfig = {
  apiKey: "AIzaSyCWKBNmhv0hu65mmkhONjhqd3l_gO0lpaE",
  authDomain: "oikos-lms-2026.firebaseapp.com",
  projectId: "oikos-lms-2026",
  storageBucket: "oikos-lms-2026.appspot.com",
  messagingSenderId: "1234567890", // Placeholder (hidden in screenshot)
  appId: "1:1234567890:web:abcdefg" // Placeholder (hidden in screenshot)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const APP_PREFIX = 'OIKOS_LMS_V1_';

export const storageService = {
  // Save to Firebase Firestore & LocalStorage (Hybrid)
  save: async (key: string, data: any) => {
    try {
      // 1. Local storage for instant access
      localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(data));
      
      // 2. Cloud storage (Firestore)
      // We store global states in a 'system' collection
      await setDoc(doc(db, "system", key), { 
        data,
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (e) {
      console.error('Failed to sync with cloud:', e);
      return false;
    }
  },

  // Load from Firebase with Local Fallback
  load: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      // 1. Try cloud first
      const docRef = doc(db, "system", key);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const cloudData = docSnap.data().data;
        // Update local cache
        localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(cloudData));
        return cloudData;
      }
      
      // 2. Fallback to local
      const localData = localStorage.getItem(`${APP_PREFIX}${key}`);
      return localData ? JSON.parse(localData) : defaultValue;
    } catch (e) {
      console.warn('Cloud load failed, using local cache:', e);
      const localData = localStorage.getItem(`${APP_PREFIX}${key}`);
      return localData ? JSON.parse(localData) : defaultValue;
    }
  },

  // Export for administrative backup
  exportAll: () => {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(APP_PREFIX)) {
        const cleanKey = key.replace(APP_PREFIX, '');
        allData[cleanKey] = JSON.parse(localStorage.getItem(key) || 'null');
      }
    }
    return allData;
  },

  clear: () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(APP_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
};
