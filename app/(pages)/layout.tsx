'use client';

import React, { createContext, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import {
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import LeftSidebar from '../components/LeftSidebar.tsx';
import RightSidebar from '../components/RightSidebar.tsx';
import { db, auth } from '../config/firebase.tsx';

export const HelloContext = React.createContext();

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // should be some check here where if not logged in, redirect back to login page etc.

  const nickname = useRef('');

  return (
    <div className="App flex w-full justify-center gap-2 bg-black">
      <LeftSidebar />
      <HelloContext.Provider value={{ nickname }}>
        {children}
      </HelloContext.Provider>
      <RightSidebar />
    </div>
  );
}
