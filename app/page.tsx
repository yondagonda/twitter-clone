'use client';

import Link from 'next/link';
import Image from 'next/image';
import Auth from './components/Auth.tsx';
import bird from '../public/assets/twitter-banner.png';
import { auth } from './config/firebase.tsx';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-10">
        <div className="col-span-6">
          <Image
            src={bird}
            alt="banner"
            className=" object-cover min-w-[1650px]"
          />
        </div>

        <div
          className="flex min-h-screen flex-col  w-full
      z-[1] bg-zinc-700 col-span-4 justify-center items-start text-white"
        >
          <div className="pl-14">
            <div className="text-4xl font-bold ">Login Page</div>
            <Auth />
            <Link href="/home">SKIP TO HOME/DEMO ACC </Link>
          </div>
        </div>
      </div>
      <div
        className="text-5xl fixed text-red-600 bottom-0 w-full text-center
      bg-black z-[10]"
      >
        Yo
      </div>
    </div>
  );
}
