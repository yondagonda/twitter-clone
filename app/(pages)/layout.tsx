'use client';

import React, { createContext, useRef, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDoc,
  addDoc,
  getDocs,
  collection,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import LeftSidebar from '../components/LeftSidebar.tsx';
import RightSidebar from '../components/RightSidebar.tsx';
import { db } from '../config/firebase.tsx';

export const HelloContext = React.createContext();

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = getAuth();
  const router = useRouter();
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState();
  const nickname = useRef('');
  const [userNickname, setUserNickname] = useState('');

  useEffect(() => {
    let authFlag = true;
    onAuthStateChanged(auth, async (user) => {
      if (authFlag) {
        authFlag = false;
        if (user) {
          console.log(`User signed in: ${user.uid}`);
          setCurrentLoggedInUser(user);
          const usersCollectionRef = collection(db, 'users');
          const data = await getDocs(usersCollectionRef);
          let newUser = true;
          data.docs.map((document) => {
            if (document.data().userId === user.uid) {
              newUser = false;
              nickname.current = document.data().userNickname; // sets current nickname to stored NN
              setUserNickname(document.data().userNickname);
            }
          });
          const monthAndYear = `${new Date().toLocaleString('default', {
            month: 'long',
          })} ${new Date().getFullYear()}`;

          if (newUser) {
            const randomNumber = Math.floor(Math.random() * 9000);
            const nameSplit = user.displayName?.split(' ').join('');
            const generateNickname = `${nameSplit}${randomNumber}`;
            nickname.current = generateNickname; // else sets current nickname as new generated one
            setUserNickname(generateNickname);

            addDoc(usersCollectionRef, {
              userId: auth?.currentUser?.uid,
              userName: auth?.currentUser?.displayName,
              userNickname: generateNickname,
              userProfileImg: auth?.currentUser?.photoURL,
              followers: [],
              following: [],
              joinedDate: monthAndYear,
            });
          }
          newUser = false;
        } else {
          console.log(`No signed in users, returning to login page....`);
          router.push('/');
        }
      }
    });
  }, []);

  return (
    <div className="App flex w-full justify-center gap-2 bg-black">
      <HelloContext.Provider value={{ nickname }}>
        <LeftSidebar
          userNickname={userNickname}
          currentLoggedInUser={currentLoggedInUser}
        />
        {children}
        <RightSidebar />
      </HelloContext.Provider>
    </div>
  );
}
