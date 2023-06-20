'use client';

import { FC } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '../config/firebase.tsx';

const Auth: FC = () => {
  console.log(auth?.currentUser?.displayName);
  console.log(auth?.currentUser?.photoURL);

  const router = useRouter();

  // setTimeout(() => {
  //   router.push('/home');
  //   // set conditions here so that if alr logged in, sends user to home
  // }, [2000]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
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
    <div className="flex flex-col">
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
