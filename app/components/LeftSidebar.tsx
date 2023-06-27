/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  signOut,
  getAuth,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useContext, useState } from 'react';
import { auth } from '../config/firebase';
import CreateTweetModal from './CreateTweetModal';
import { HelloContext } from '../(pages)/layout';

export default function LeftSidebar({
  userNickname,
  currentLoggedInUser,
}: any) {
  const {
    setTweetContent,
    setImagePreview,
    setImageUpload,
    isCreateTweetModalOpen,
    setIsCreateTweetModalOpen,
    clearInputs,
  }: any = useContext(HelloContext);

  const router = useRouter();

  const onLogoutClick = async () => {
    router.push('/');
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickOutside = (event) => {
    const logoutmodal = document.querySelector('.logoutmodal');
    if (logoutmodal && !logoutmodal.contains(event.target)) {
      logoutmodal.classList.add('hidden');
      document.querySelector('.displaylogoutmodal').style.pointerEvents =
        'auto';
    }
  };

  const onAccountModalClick = () => {
    document.querySelector('.logoutmodal')?.classList.remove('hidden');
    document.addEventListener('mousedown', handleClickOutside);
    document.querySelector('.displaylogoutmodal').style.pointerEvents = 'none';
  };

  // INITAL DEMO ACCOUNT CREATION SETUP STUFF
  if (currentLoggedInUser?.email === 'walter@gmail.com') {
    updateProfile(currentLoggedInUser, {
      photoURL:
        'https://media.wbur.org/wp/2013/09/0927_Walter_White_cog1-1000x546.jpg',
      displayName: 'Walter White',
    })
      .then(() => {
        console.log(currentLoggedInUser);
      })
      .catch((error) => {
        alert(
          'Sorry, demo account currently not working right now. Please continue with a Google Account.'
        );
      });
  }

  return (
    <div
      className=" h-full bg-transparent text-[#e7e9ea] flex flex-col items-end xl:items-start 
      min-w-[55px] sm:min-w-[10%] sm:pr-1.5 xl:mr-36 2xl:mr-[160px]"
    >
      <div
        className="flex flex-col justify-between h-full items-center 
      fixed z-[3]"
      >
        <div
          className="flex flex-col gap-[12px] text-lg items-center 
        xl:items-start w-full xl:w-[220px]"
        >
          <Link
            href="/home"
            className="px-3 pt-3 pb-2.5 mt-2.5 rounded-full hover:bg-[#171818] duration-200"
          >
            <svg
              viewBox="0 0 48 48"
              id="Layer_2"
              width={34}
              height={34}
              data-name="Layer 2"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-[#e7e9ea]"
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
          </Link>

          <Link
            href="/home"
            className="flex items-center gap-4 rounded-full hover:bg-[#171818] py-2.5 px-3 duration-200"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5h-13c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Home</div>
          </Link>
          <div className="cursor-not-allowed flex gap-4 py-2.5 px-3">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Explore</div>
          </div>
          <div className="cursor-not-allowed flex gap-4 py-2.5 px-3">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Notifications</div>
          </div>
          <div className="cursor-not-allowed flex gap-4 py-2.5 px-3">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Messages</div>
          </div>
          <div className="cursor-not-allowed flex gap-4 py-2.5 px-3">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Lists</div>
          </div>
          <div className="cursor-not-allowed flex gap-4 py-2.5 px-3">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Bookmarks</div>
          </div>
          <div className="cursor-not-allowed flex gap-4 py-2.5 px-3">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M7.501 19.917L7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672-.444.478-.851 1.03-1.212 1.656-.507-.204-1.054-.329-1.658-.329-2.767 0-4.57 2.223-4.938 6.004H7.56c-.023.302-.05.599-.059.917zm15.998.056L23.528 21H9.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977s6.816 2.358 7 8.977zM21.437 19c-.367-3.781-2.17-6.004-4.938-6.004s-4.57 2.223-4.938 6.004h9.875zm-4.938-9c-.799 0-1.527-.279-2.116-.73-.836-.64-1.384-1.638-1.384-2.77 0-1.93 1.567-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.132-.548 2.13-1.384 2.77-.589.451-1.317.73-2.116.73zm-1.5-3.5c0 .827.673 1.5 1.5 1.5s1.5-.673 1.5-1.5-.673-1.5-1.5-1.5-1.5.673-1.5 1.5zM7.5 3C9.433 3 11 4.57 11 6.5S9.433 10 7.5 10 4 8.43 4 6.5 5.567 3 7.5 3zm0 2C6.673 5 6 5.673 6 6.5S6.673 8 7.5 8 9 7.327 9 6.5 8.327 5 7.5 5z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Communities</div>
          </div>
          <div className="cursor-not-allowed flex gap-4 py-2.5 px-3">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M8.52 3.59c.8-1.1 2.04-1.84 3.48-1.84s2.68.74 3.49 1.84c1.34-.21 2.74.14 3.76 1.16s1.37 2.42 1.16 3.77c1.1.8 1.84 2.04 1.84 3.48s-.74 2.68-1.84 3.48c.21 1.34-.14 2.75-1.16 3.77s-2.42 1.37-3.76 1.16c-.8 1.1-2.05 1.84-3.49 1.84s-2.68-.74-3.48-1.84c-1.34.21-2.75-.14-3.77-1.16-1.01-1.02-1.37-2.42-1.16-3.77-1.09-.8-1.84-2.04-1.84-3.48s.75-2.68 1.84-3.48c-.21-1.35.14-2.75 1.16-3.77s2.43-1.37 3.77-1.16zm3.48.16c-.85 0-1.66.53-2.12 1.43l-.38.77-.82-.27c-.96-.32-1.91-.12-2.51.49-.6.6-.8 1.54-.49 2.51l.27.81-.77.39c-.9.46-1.43 1.27-1.43 2.12s.53 1.66 1.43 2.12l.77.39-.27.81c-.31.97-.11 1.91.49 2.51.6.61 1.55.81 2.51.49l.82-.27.38.77c.46.9 1.27 1.43 2.12 1.43s1.66-.53 2.12-1.43l.39-.77.82.27c.96.32 1.9.12 2.51-.49.6-.6.8-1.55.48-2.51l-.26-.81.76-.39c.91-.46 1.43-1.27 1.43-2.12s-.52-1.66-1.43-2.12l-.77-.39.27-.81c.32-.97.12-1.91-.48-2.51-.61-.61-1.55-.81-2.51-.49l-.82.27-.39-.77c-.46-.9-1.27-1.43-2.12-1.43zm4.74 5.68l-6.2 6.77-3.74-3.74 1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Verified</div>
          </div>
          <Link
            href={`/user/${userNickname}`}
            className="flex items-center gap-4 rounded-full hover:bg-[#171818] py-2.5 px-3 duration-200"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">Profile</div>
          </Link>
          <div className="cursor-not-allowed flex gap-4 py-2.5 px-3">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={28}
              width={28}
              className="fill-[#e7e9ea]"
            >
              <g>
                <path d="M3.75 12c0-4.56 3.69-8.25 8.25-8.25s8.25 3.69 8.25 8.25-3.69 8.25-8.25 8.25S3.75 16.56 3.75 12zM12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-4.75 11.5c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25S6 11.31 6 12s.56 1.25 1.25 1.25zm9.5 0c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25zM13.25 12c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25.56-1.25 1.25-1.25 1.25.56 1.25 1.25z"></path>
              </g>
            </svg>
            <div className="text-xl hidden xl:block">More</div>
          </div>

          <button
            onClick={() => {
              setIsCreateTweetModalOpen(true);
              clearInputs();
            }}
            className="font-bold text-[15.3px] bg-[#1d9bf0] hover:bg-[#1784cc] duration-200
            py-3 rounded-3xl xl:w-full xl:px-14"
          >
            <div className="w-12 flex justify-center rounded-full xl:hidden">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="fill-[#e7e9ea]"
                height={28}
                width={28}
              >
                <g>
                  <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z"></path>
                </g>
              </svg>
            </div>
            <div className="hidden xl:block text-white">Tweet</div>
          </button>

          {isCreateTweetModalOpen && (
            <div className="bg-blue-300/20 fixed top-0 left-0 right-0 bottom-0 z-[1] ">
              <CreateTweetModal
                setIsCreateTweetModalOpen={setIsCreateTweetModalOpen}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div
            className="logoutmodal mb-1 rounded-xl flex fixed bottom-20 bg-black 
          hidden flex-col ml-16 md:ml-10 xl:ml-0"
          >
            <button
              className="py-2.5 px-2 xl:px-4 text-start font-bold hover:bg-[#1b1b1b] duration-150
            cursor-not-allowed text-sm xl:text-base"
            >
              Add an existing account
            </button>
            <button
              onClick={onLogoutClick}
              className="py-2.5 px-4 text-start font-bold hover:bg-[#1b1b1b] duration-150
              text-sm xl:text-base truncate"
            >
              Log out @{userNickname && userNickname}
            </button>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={20}
              width={20}
              className="corner"
            >
              <g>
                <path d="M22 17H2L12 6l10 11z"></path>
              </g>
            </svg>
          </div>

          <button
            onClick={onAccountModalClick}
            className="flex items-center gap-2.5 cursor-pointer py-2 px-1.5 sm:px-3
      mb-3 w-full 2xl:px-4 2xl:py-2.5 rounded-full hover:bg-[#1b1b1b] duration-200 
      displaylogoutmodal"
          >
            {currentLoggedInUser?.photoURL && (
              <div>
                <img
                  src={`${currentLoggedInUser.photoURL}`}
                  className="h-10 rounded-full w-full max-w-[40px] object-cover"
                  alt="profile photo"
                />
              </div>
            )}
            <div className="hidden xl:block">
              <div className="text-sm font-bold text-start">
                {currentLoggedInUser?.displayName}
              </div>
              <div className="text-sm text-start text-[#71767b]">
                {userNickname && `@${userNickname}`}
              </div>
            </div>
            <div className="hidden xl:block  xl:pl-8 2xl:pl-10">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                height={20}
                width={20}
                className="fill-[#e7e9ea]"
              >
                <g>
                  <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                </g>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
