'use client';

import { FC, useEffect, useContext } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase.tsx';
import { HelloContext } from '../(pages)/layout.tsx';

const Auth: FC = () => {
  console.log(auth?.currentUser?.displayName);
  console.log(auth?.currentUser?.photoURL);
  const router = useRouter();

  if (auth?.currentUser?.displayName !== undefined) {
    router.push('/home');
  }
  // console.log(auth?.currentUser);

  useEffect(() => {
    let authFlag = true;
    onAuthStateChanged(auth, async (user) => {
      if (authFlag) {
        authFlag = false;
        if (user) {
          router.push('/home'); // ensures a logged in user gets redirected if on page '/'
        }
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      if (auth?.currentUser) {
        router.push('/home'); // ensures redirect to home page on successful login
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col text-white text-xl">
      <input
        placeholder="email"
        onChange={() => console.log(auth?.currentUser?.displayName)}
      />
      <input
        placeholder="password"
        type="password"
        onChange={() => console.log(auth?.currentUser?.displayName)}
      />
      <button>Sign in</button>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <button onClick={logout}>Log out</button>
    </div>
  );
};

export default Auth;
