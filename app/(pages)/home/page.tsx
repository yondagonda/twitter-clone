/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @next/next/no-img-element */

'use client';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, useContext, useRef } from 'react';
import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import Tweetlist from '@/app/components/Tweetlist.tsx';
import { uploadBytes, ref, getDownloadURL, listAll } from 'firebase/storage';
import { v4 } from 'uuid';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parseISO from 'date-fns/parseISO';
import { parse, toDate } from 'date-fns';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import isToday from 'date-fns/isToday';
import differenceInHours from 'date-fns/differenceInHours';
import useAutosizeTextArea from '@/app/components/useAutoSizeTextArea.tsx';
import { db, app, storage } from '../../config/firebase.tsx';
import { HelloContext } from '../layout.tsx';

export default function Home() {
  app; // re-initialises firebase
  const auth = getAuth();
  const { nickname } = useContext(HelloContext);

  const tweetsCollectionRef = collection(db, 'tweets'); // holds all tweets
  const [allTweets, setAllTweets] = useState<{}>([]);
  const [tweetContent, setTweetContent] = useState('');

  const getAllTweets = async () => {
    try {
      const data = await getDocs(tweetsCollectionRef);

      const filteredData = data.docs.map((document) => ({
        ...document.data(),
        id: document.id,
      }));
      const sortedTweets = filteredData.sort((a, b) =>
        b.date.localeCompare(a.date)
      );
      const DateSortedTweets = sortedTweets.map((tweet) => {
        const parsedDateFirst = parse(
          tweet.date,
          'dd/MM/yyyy, HH:mm:ss',
          new Date()
        );
        const formattedDate = format(parsedDateFirst, 'yyyy-MM-dd HH:mm:ss');
        const parsedDate = parse(
          formattedDate,
          'yyyy-MM-dd HH:mm:ss',
          new Date()
        );
        const differenceSecs = differenceInSeconds(new Date(), parsedDate);
        const differenceMins = differenceInMinutes(new Date(), parsedDate);
        const differenceHrs = differenceInHours(new Date(), parsedDate);

        let finalDate;
        if (differenceSecs < 2) {
          finalDate = `now`;
        } else if (differenceSecs < 60) {
          finalDate = `${differenceSecs}s`;
        } else if (differenceMins < 60) {
          finalDate = `${differenceMins}m`;
        } else if (differenceHrs < 24) {
          finalDate = `${differenceHrs}h`;
        } else {
          finalDate = format(parsedDate, 'dd MMM');
        }
        return { ...tweet, date: finalDate };
      });
      console.log(DateSortedTweets);
      setAllTweets(DateSortedTweets);
    } catch (err) {
      console.error(err);
    }
  };

  const [imageUpload, setImageUpload] = useState<any>();
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e) => {
    setImageUpload(e.target.files[0]);
    const img = URL.createObjectURL(e.target.files[0]);
    console.log(img);
    setImagePreview(img);
    document.querySelector('.everyonecanreply')?.classList.remove('hidden');
    document.querySelector('.everyonedropdown')?.classList.remove('hidden');
  };

  const renderPreview = () => (
    <img
      src={imagePreview}
      alt={`preview of image`}
      className="rounded-xl max-w-[100%] max-h-[300px]"
    />
  );

  const [imageURL, setImageURL] = useState('');
  const [imageID, setImageID] = useState('');

  const uploadFile = async () => {
    setImagePreview('');
    document.getElementById('pickimage')!.value = ''; // allows onchange to fire every time

    if (imageUpload === undefined) {
      console.log(tweetContent);
      setImageURL('');
      setImageID('');
      setImageUpload();
      setTweetContent('');
      onSubmitTweet();
      return;
    }
    console.log(imageUpload);
    const imageName = v4() + imageUpload.name;
    console.log(imageName);

    const filesFolderRef = ref(storage, `tweetImage/${imageName}`);
    const snapshot = await uploadBytes(filesFolderRef, imageUpload);
    const url = await getDownloadURL(snapshot.ref);

    setImageURL(url);
    setImageID(imageName);
    setImageUpload();
  };

  useEffect(() => {
    if (imageURL) {
      onSubmitTweet(); // chaining async functions through useEffect fixed our image uploading issues
      setTweetContent('');
      setImageURL('');
      setImageID('');
    }
  }, [imageURL]);

  const onSubmitTweet = async () => {
    document.querySelector('.everyonecanreply')?.classList.add('hidden');
    document.querySelector('.everyonedropdown')?.classList.add('hidden');
    try {
      await addDoc(tweetsCollectionRef, {
        text: tweetContent,
        authorId: auth?.currentUser?.uid,
        date: new Date().toLocaleString(),
        authorName: auth?.currentUser?.displayName,
        authorNickname: nickname.current,
        likedBy: [],
        replies: 0,
        isAReply: false,
        parentTweet: null,
        parentTweetNickname: null,
        authorProfileImg: auth?.currentUser?.photoURL,
        image: { imageId: imageID, imageUrl: imageURL },
      });
      getAllTweets();
    } catch (err) {
      console.error(err);
    }
  };

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

  const createtweet = document.querySelector('.createtweetinput');
  createtweet?.addEventListener('mousedown', () => {
    document.querySelector('.everyonecanreply')?.classList.remove('hidden');
    document.querySelector('.everyonedropdown')?.classList.remove('hidden');
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, tweetContent);

  // TODO (prioritising on what would be most impressive/what is most reminiscent of using twitter):
  // finish tweet popup modal + create image preview deletion
  // user profile descriptions
  // cleanup login page
  // demo account functionality
  // mini displays when hovering over names?
  // start refactoring functions into separate components/hooks, like e.g. the text area one

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
          <div className="text-[#71767b]">Following</div>
        </div>
      </div>
      <div className="flex px-4 pt-4 pb-2 gap-3 border-b-[1px] border-[#2f3336] ">
        <div>
          <img
            src={`${auth?.currentUser?.photoURL}`}
            className="h-10 rounded-full min-w-[40px] mt-1"
            alt="profile photo"
          />
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
                value={tweetContent}
                rows={1}
                onChange={(e) => setTweetContent(e.target.value)}
              ></textarea>
            </div>
            {imagePreview && <div className="">{renderPreview()}</div>}
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
              <label htmlFor="pickimage" className="cursor-pointer">
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
                  accept="image/*"
                  className="hidden"
                  id="pickimage"
                  onChange={handleImageChange}
                />
              </label>

              <button
                className=" px-4 py-1.5 rounded-3xl bg-[#1d9bf0] h-auto text-sm font-bold"
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
