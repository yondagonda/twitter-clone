'use client';

import Image from 'next/image';
import React from 'react';
import Auth from './components/Auth.tsx';
import bird from '../public/assets/twitter-banner.png';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full lg:grid lg:grid-cols-10">
        <figure className="col-span-5 relative hidden lg:block">
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={400}
              width={400}
              className="fill-white"
            >
              <g>
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
              </g>
            </svg>
          </div>
          <Image
            src={bird}
            alt="banner"
            className=" object-cover min-w-[1850px]"
          />
        </figure>

        <main
          className="flex min-h-screen flex-col  w-full items-center
       z-[1] bg-black col-span-5 sm:items-start text-[#e7e9ea] pt-6 sm:pt-[270px]"
        >
          <div className="sm:pl-14">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 248 204"
              height={60}
              width={60}
            >
              <path
                fill="#1d9bf0"
                d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"
              />
            </svg>
          </div>
          <hgroup className="sm:pl-14">
            <h1 className="text-3xl lg:text-[55px] 2xl:text-[90px] font-bold py-10 lg:mt-10 2xl:mt-14">
              Happening now
            </h1>
            <h2 className="text-xl sm:text-4xl font-bold lg:pt-10 2xl:pt-14">
              Join Twitter today.
            </h2>
          </hgroup>
          <Auth />
        </main>
      </div>
    </div>
  );
}
