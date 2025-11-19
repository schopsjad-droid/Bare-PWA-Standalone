import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl-7-ZhEWO0CBMHu24ebz0rNNBy6pocsg",
  authDomain: "bare-android-app.firebaseapp.com",
  projectId: "bare-android-app",
  storageBucket: "bare-android-app.firebasestorage.app",
  messagingSenderId: "674613626915",
  appId: "1:674613626915:web:1be46ae70b19cfb1600996",
  measurementId: "G-1DVHX07887"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize messaging (only if supported)
let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { messaging };
export default app;

