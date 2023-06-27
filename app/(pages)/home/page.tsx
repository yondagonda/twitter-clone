/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @next/next/no-img-element */

'use client';

import { getAuth } from 'firebase/auth';
import { useEffect, useContext, useRef, useState } from 'react';
import {
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import Tweetlist from '@/app/components/Tweetlist.tsx';
import useAutosizeTextArea from '@/app/components/useAutoSizeTextArea.tsx';
import { db, app } from '../../config/firebase.tsx';
import { HelloContext } from '../layout.tsx';

export default function Home() {
  app; // re-initialises firebase
  const auth = getAuth();
  const {
    nickname,
    tweetContent,
    setTweetContent,
    imagePreview,
    handleImageChange,
    setImagePreview,
    setImageUpload,
    imageUpload,
    imageURL,
    uploadFile,
    allTweets,
    getAllTweets,
    onSubmitTweet,
    setImageID,
    setImageURL,
    renderPreview,
    isCreateTweetModalOpen,
    setIsCreateTweetModalOpen,
  }: any = useContext(HelloContext);

  useEffect(() => {
    if (imageURL) {
      onSubmitTweet(); // chaining async functions through useEffect fixed our image uploading issues
      setTweetContent('');
      setImageURL('');
      setImageID('');
    }
  }, [imageURL]);

  useEffect(() => {
    getAllTweets();
  }, []);

  const deleteTweet = async (e: any, tweet: any) => {
    e.preventDefault();

    const tweetsDocRef = doc(db, 'tweets', tweet.id);
    await deleteDoc(tweetsDocRef);
    getAllTweets();
  };

  const likeTweet = async (e: any, tweet: any) => {
    e.preventDefault();

    const likeRef = doc(db, 'tweets', tweet.id);
    const getLikes = await getDoc(likeRef);

    const likesSoFar = getLikes?.data()?.likedBy;
    if (likesSoFar.includes(auth?.currentUser?.uid)) {
      await updateDoc(likeRef, {
        likedBy: arrayRemove(auth?.currentUser?.uid),
      });
    } else {
      await updateDoc(likeRef, {
        likedBy: arrayUnion(auth?.currentUser?.uid),
      });
    }
    getAllTweets();
  };

  if (typeof window !== 'undefined') {
    const createtweet = document.querySelector('.createtweetinput');
    createtweet?.addEventListener('mousedown', () => {
      document.querySelector('.everyonecanreply')?.classList.remove('hidden');
      document.querySelector('.everyonedropdown')?.classList.remove('hidden');
    });
  }

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, tweetContent);

  // TODO:
  // figure out what to put in trending section

  // typescript all the things, next.config typescript + eslint being ignored during build oof

  return (
    <div
      className="min-h-screen border-x border-[#2f3336]
     text-[#e7e9ea] flex flex-col min-w-[270px] w-full max-w-[600px]"
    >
      <div className="grid grid-rows-2 sticky top-0 bg-black/40 backdrop-blur-md z-[1]">
        <div className="font-bold text-xl pt-3 pb-3 px-4">Home</div>
        <div
          className="grid grid-cols-2 text-center border-b-[1px] border-[#2f3336] items-center
         cursor-pointer"
        >
          <div className="flex justify-center">
            <div className="font-bold">For you</div>
            <div className="bg-[#1d9bf0] h-1 absolute bottom-0 w-[63px] rounded-full"></div>
          </div>
          <div className="text-[#71767b] cursor-not-allowed">Following</div>
        </div>
      </div>
      <div className="flex px-4 pt-4 pb-2 gap-3 border-b-[1px] border-[#2f3336] ">
        <div>
          {auth.currentUser?.photoURL && (
            <img
              src={`${auth?.currentUser?.photoURL}`}
              className="h-10 rounded-full mt-1 hover:brightness-90 duration-200 w-full max-w-[40px] 
              object-cover min-w-[40px]"
              alt="profile photo"
            />
          )}
        </div>
        <div className="flex flex-col w-full">
          <div
            className="everyonedropdown hidden w-fit outline-[#536471] outline outline-1 px-4 py-0.5 
            rounded-3xl items-center flex gap-1 text-sm mb-4 font-bold"
          >
            <div className="text-[#1d9bf0]">Everyone</div>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={16}
              width={16}
              className="fill-[#1d9bf0]"
            >
              <g>
                <path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"></path>
              </g>
            </svg>
          </div>
          <div className="group">
            <div className="">
              <textarea
                ref={textAreaRef}
                maxLength={140}
                className="bg-transparent pb-2 mt-2 outline-none text-xl peer createtweetinput 
              w-full resize-none placeholder:text-[#71767b]"
                placeholder="What's happening?!"
                value={isCreateTweetModalOpen ? '' : tweetContent}
                rows={1}
                onChange={(e) => setTweetContent(e.target.value)}
              ></textarea>
            </div>
            {imagePreview && !isCreateTweetModalOpen ? renderPreview() : null}
            <div className="hidden peer-focus:block everyonecanreply">
              <div className="border-b border-[#2f3336] text-[#1d9bf0] pt-2 pb-2 mb-2 text-sm font-bold flex gap-1 items-center">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  height={16}
                  width={16}
                  className="fill-[#1d9bf0]"
                >
                  <g>
                    <path d="M12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-.25 10.48L10.5 17.5l-2-1.5v-3.5L7.5 9 5.03 7.59c1.42-2.24 3.89-3.75 6.72-3.84L11 6l-2 .5L8.5 9l5 1.5-1.75 1.73zM17 14v-3l-1.5-3 2.88-1.23c1.17 1.42 1.87 3.24 1.87 5.23 0 1.3-.3 2.52-.83 3.61L17 14z"></path>
                  </g>
                </svg>
                <div>Everyone can reply</div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="flex justify-between items-center">
              <label
                htmlFor="pickimage"
                className="cursor-pointer p-2 hover:bg-[#02131f] duration-200 rounded-full 
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  width={22}
                  height={22}
                  className="fill-[#1d9bf0]"
                >
                  <g>
                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path>
                  </g>
                </svg>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  id="pickimage"
                  onChange={handleImageChange}
                />
              </label>

              <button
                className={`px-4 py-1.5 rounded-3xl bg-[#1d9bf0] h-auto text-sm font-bold 
                
                ${
                  tweetContent !== '' && isCreateTweetModalOpen === false
                    ? 'pointer-events-auto brightness-100'
                    : 'pointer-events-none brightness-50'
                } `}
                onClick={uploadFile}
              >
                <div className="text-white">Tweet</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Tweetlist
        auth={auth}
        allTweets={allTweets}
        deleteTweet={deleteTweet}
        likeTweet={likeTweet}
      />
    </div>
  );
}
