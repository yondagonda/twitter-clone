'use client';

import Link from 'next/link';
import Auth from './components/Auth.tsx';

export default function LoginPage() {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center p-24">
        <div className="text-3xl">Login Page</div>

        <Auth />

        <Link href="/home">SKIP TO HOME PAGE NOW</Link>
      </div>
    </>
  );
}
