import { initializeApp, firebase } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAyodM6y62sVplORMeqh8Wxt_UgDX2ESHg',
  authDomain: 'twitter-clone-7c274.firebaseapp.com',
  projectId: 'twitter-clone-7c274',
  storageBucket: 'twitter-clone-7c274.appspot.com',
  messagingSenderId: '700832702070',
  appId: '1:700832702070:web:3e9a9f3d746367150a4957',
  measurementId: 'G-9ZX35CTPFN',
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export { app };

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Firestore Database stuff
export const db = getFirestore(app);
export const storage = getStorage(app);
