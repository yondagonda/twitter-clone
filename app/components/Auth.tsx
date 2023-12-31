/* eslint-disable no-alert */

'use client';

import React, { FC, useEffect, useState } from 'react';
import {
  signInWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../config/firebase.tsx';
import aang from '../../public/assets/aang.jpg';
import walter from '../../public/assets/walter.jpg';
import batman from '../../public/assets/batman.jpg';
import LoadingPage from './LoadingPage.tsx';

const Auth: FC = () => {
  const router = useRouter();

  const [showLoading, setShowLoading] = useState<boolean>(false);

  if (auth?.currentUser?.displayName !== undefined) {
    router.push('/home');
  }

  useEffect(() => {
    let authFlag = true;
    onAuthStateChanged(auth, async (user) => {
      if (authFlag) {
        authFlag = false;
        if (user) {
          setShowLoading(true);
          router.push('/home'); // ensures a logged in user gets redirected if on page '/'
        }
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      if (auth?.currentUser) {
        setShowLoading(true);
        router.push('/home'); // ensures redirect to home page on successful login
      }
    } catch (err) {
      setShowLoading(false);
      console.error(err);
    }
  };

  const signInToWalter = async () => {
    try {
      setShowLoading(true);
      await signInWithEmailAndPassword(auth, 'walter@gmail.com', 'walter123');
      if (auth?.currentUser) {
        router.push('/home'); // ensures redirect to home page on successful login
      }
    } catch (err) {
      setShowLoading(false);
      alert(
        'Sorry, demo account is currently not working right now. Please continue with a Google Account.'
      );
    }
  };

  const signInToAang = async () => {
    try {
      setShowLoading(true);
      await signInWithEmailAndPassword(auth, 'aang@gmail.com', 'aang123');
      if (auth?.currentUser) {
        router.push('/home'); // ensures redirect to home page on successful login
      }
    } catch (err) {
      setShowLoading(false);
      alert(
        'Sorry, demo account is currently not working right now. Please continue with a Google Account.'
      );
    }
  };

  const signInToBatman = async () => {
    try {
      setShowLoading(true);
      await signInWithEmailAndPassword(auth, 'batman@gmail.com', 'batman123');
      if (auth?.currentUser) {
        router.push('/home'); // ensures redirect to home page on successful login
      }
    } catch (err) {
      setShowLoading(false);
      alert(
        'Sorry, demo account is currently not working right now. Please continue with a Google Account.'
      );
    }
  };

  const demoAccProfileImageCSS = `h-[68px] w-[68px] rounded-full object-cover border-[2px] border-[#536471]
  group-hover:border-[#c5cace] duration-200`;

  const demoAccProfileBtnCSS = 'flex flex-col items-center gap-1 group';

  return (
    <div className="flex flex-col text-lg pl-2 sm:pl-14 pt-8 gap-4">
      {showLoading && <LoadingPage />}

      <button
        className="py-3 px-8 sm:px-20 rounded-full bg-[#e7e9ea] text-black font-bold
        flex items-center gap-4 hover:bg-[#d1d1d1] duration-200"
        onClick={signInWithGoogle}
      >
        <div>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            height={20}
            width={20}
          >
            <g>
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              ></path>
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              ></path>
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              ></path>
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              ></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </g>
          </svg>
        </div>
        <h3>Continue with Google</h3>
      </button>

      <button
        className="py-3 px-8 sm:px-20 text-white rounded-full bg-[#1d9bf0] font-bold
       cursor-not-allowed"
      >
        <h3>Sign up</h3>
      </button>

      <button
        className="py-3 px-8 sm:px-20 text-[#1d9bf0] font-bold rounded-full
      outline-[#536471] outline outline-[0.5px] 
      cursor-not-allowed"
      >
        <h3>Log in</h3>
      </button>

      <div className="grid-cols-[1fr_auto_1fr] grid items-center">
        <div className="h-[1px] bg-[#2f3336]"></div>
        <h4 className="px-3">OR use a demo account</h4>
        <div className="h-[1px] bg-[#2f3336]"></div>
      </div>

      <div className="flex justify-around">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.98 }}
          className={demoAccProfileBtnCSS}
          onClick={signInToBatman}
        >
          <Image
            alt="avatar aang"
            src={batman}
            className={demoAccProfileImageCSS}
            draggable={false}
          />
          <h4>Batman</h4>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.98 }}
          className={demoAccProfileBtnCSS}
          onClick={signInToAang}
        >
          <Image
            alt="avatar aang"
            src={aang}
            className={demoAccProfileImageCSS}
            draggable={false}
          />
          <h4>Aang</h4>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.98 }}
          className={demoAccProfileBtnCSS}
          onClick={signInToWalter}
        >
          <Image
            alt="avatar aang"
            src={walter}
            className={demoAccProfileImageCSS}
            draggable={false}
          />
          <h4>Walter</h4>
        </motion.button>
      </div>
    </div>
  );
};

export default Auth;
