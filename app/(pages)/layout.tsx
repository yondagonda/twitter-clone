import React from 'react';
import LeftSidebar from '../components/LeftSidebar.tsx';
import RightSidebar from '../components/RightSidebar.tsx';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // should be some check here where if not logged in, redirect back to login page etc.
  return (
    <div className="App flex w-full justify-center gap-2 bg-black">
      <LeftSidebar />

      {children}
      <RightSidebar />
    </div>
  );
}
