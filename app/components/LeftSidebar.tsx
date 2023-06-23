import Link from 'next/link';
import { signOut, getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useContext, useState } from 'react';
import { auth } from '../config/firebase';

export default function LeftSidebar({
  userNickname,
  currentLoggedInUser,
}: any) {
  const router = useRouter();
  // console.log(userNickname);

  const onLogoutClick = async () => {
    router.push('/');
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className=" left-0 h-full bg-transparent ml-14 border text-white px-10 py-4 fixed">
      <Link href="/home">
        <div className="pb-3">
          <svg
            viewBox="0 0 48 48"
            id="Layer_2"
            width={40}
            height={40}
            data-name="Layer 2"
            xmlns="http://www.w3.org/2000/svg"
            fill="#ffffff"
            stroke="#ffffff"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <defs></defs>
              <path
                className="cls-1"
                d="M38.74,16.55v1c0,10.07-7.64,21.61-21.62,21.61A21.14,21.14,0,0,1,5.5,35.71a12.22,12.22,0,0,0,1.81.11,15.25,15.25,0,0,0,9.44-3.24,7.56,7.56,0,0,1-7.1-5.29,6.9,6.9,0,0,0,1.44.15,7.53,7.53,0,0,0,2-.27A7.57,7.57,0,0,1,7,19.72v-.1a7.42,7.42,0,0,0,3.44.94A7.54,7.54,0,0,1,8.05,10.5a21.58,21.58,0,0,0,15.68,7.94,6.38,6.38,0,0,1-.21-1.74,7.55,7.55,0,0,1,13.17-5.31,15.59,15.59,0,0,0,4.83-1.85,7.65,7.65,0,0,1-3.39,4.27,15.87,15.87,0,0,0,4.37-1.26,15.56,15.56,0,0,1-3.76,4Z"
              ></path>
            </g>
          </svg>
        </div>
      </Link>

      <div className="flex flex-col gap-4 text-lg">
        <Link href="/home">Home</Link>
        <div>Explore</div>
        <div>Notifications</div>
        <div>Messages</div>
        <div>Lists</div>
        <div>Bookmarks</div>
        <div>Communities</div>
        <div>Verified</div>
        <Link href={`/user/${userNickname}`}>Profile</Link>
        <div>More</div>
        <div>img</div>
        <div className="font-bold">Tweet</div>
      </div>
      <div className="bottom-0 fixed py-10">
        <button className="text-red-400" onClick={onLogoutClick}>
          Log Out
        </button>

        <div className="text-sm">{currentLoggedInUser?.displayName}</div>
        {currentLoggedInUser && (
          <Image
            width={0}
            height={0}
            sizes="100vw"
            src={`${currentLoggedInUser.photoURL}`}
            className="h-8 rounded-full w-auto"
            alt="profile photo"
          />
        )}
        <div className="text-sm">{userNickname && `@${userNickname}`}</div>
      </div>
    </div>
  );
}
