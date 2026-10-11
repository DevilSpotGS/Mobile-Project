import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyD1Ds4UVgM1MrrsLj-MgwTNA9nTdCK-9m8",
  authDomain: "studysync-3000c.firebaseapp.com",
  projectId: "studysync-3000c",
  storageBucket: "studysync-3000c.firebasestorage.app",
  messagingSenderId: "28709540318",
  appId: "1:28709540318:web:4a7e41ab0cbad662514d4f"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);