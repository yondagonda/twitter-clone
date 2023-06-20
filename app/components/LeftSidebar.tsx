'use client';

import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../config/firebase.tsx';

export default function LeftSidebar() {
  const router = useRouter();

  const onLogoutClick = async () => {
    router.push('/');
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className=" left-0 h-full bg-transparent mx-10 border text-white px-2 py-4">
      <div>
        <div>Twitter Logo</div>
        <Link href="/home">Home</Link>
        <div>Explore</div>
        <div>Notifications</div>
        <div>Messages</div>
        <div>Lists</div>
        <div>Bookmarks</div>
        <div>Communities</div>
        <div>Verified</div>
        <div>Profile</div>
        <div>More</div>
        <div>img</div>
        <div className="font-bold">Tweet</div>
        <button onClick={onLogoutClick}>Log Out</button>
      </div>
    </div>
  );
}
