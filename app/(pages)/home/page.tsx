/* eslint-disable @next/next/no-img-element */

'use client';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, useContext } from 'react';
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
  };

  const renderPreview = () => (
    <img
      src={imagePreview}
      alt={`preview of image`}
      className="rounded-xl max-w-[240px]"
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
    console.log(imageURL);
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
    // console.log(getLikes?.data()?.likedBy);

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

  const user = auth?.currentUser?.displayName;

  return (
    <div className="min-h-screen bg-slate-600 dark:bg-zinc-800 w-full max-w-[47%] text-white">
      <div className="grid grid-rows-2 sticky top-0 bg-black/40 backdrop-blur-md">
        <div className="font-bold text-xl p-3">Home {user && user}</div>
        <div
          className="grid grid-cols-2 text-center border-b-[1px] border-slate-800 items-center
         cursor-pointer"
        >
          <div className="font-bold ">For you</div>
          <div>Following</div>
        </div>
      </div>
      <div className="flex p-4 gap-3">
        <div>
          <img
            src={`${auth?.currentUser?.photoURL}`}
            className="h-8 rounded-full min-w-[32px]"
            alt="profile photo"
          />
        </div>
        <div className="flex flex-col">
          <input
            className="bg-transparent ring-2 py-2 px-14"
            placeholder="What's happening?"
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
          ></input>

          <div className="w-full">
            <div className="flex justify-between">
              {imagePreview && <div className="">{renderPreview()}</div>}
              <input
                type="file"
                accept="image/*"
                className="text-xs hidden"
                id="pickimage"
                onChange={handleImageChange}
              ></input>
              <label htmlFor="pickimage" className="cursor-pointer">
                Select file
              </label>
              <button
                className="right-0 px-4 py-1 rounded-3xl bg-blue-400 h-auto"
                onClick={uploadFile}
              >
                Tweet
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
