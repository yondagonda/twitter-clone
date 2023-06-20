'use client';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, useRef, useContext } from 'react';
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
import { uploadBytes, ref } from 'firebase/storage';
import { db, app, storage } from '../../config/firebase.tsx';
import { HelloContext } from '../layout.tsx';

export default function Home() {
  app; // re-initialises firebase
  const auth = getAuth();
  // console.log(auth?.currentUser?.photoURL); // USE FOR USER THUMBNAIL LATER
  const { nickname } = useContext(HelloContext);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`User signed in: ${user.uid}`);
        console.log(user.displayName);
        const nameSplit = user.displayName?.split(' ').join('');
        nickname.current = `${nameSplit}3425`;
      } else {
        console.log(`No signed in users, returning to login page....`);
      }
    });
  }, []);

  const tweetsCollectionRef = collection(db, 'tweets'); // holds all tweets

  const [allTweets, setAllTweets] = useState<{}>([]);
  const [tweetContent, setTweetContent] = useState('');
  const [ImageUpload, setImageUpload] = useState<File>();

  const getAllTweets = async () => {
    try {
      const data = await getDocs(tweetsCollectionRef);

      const filteredData = data.docs.map((document) => ({
        ...document.data(),
        id: document.id,
      }));
      setAllTweets(filteredData);
      console.log(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAllTweets();
  }, []);

  const uploadFile = async () => {
    if (!ImageUpload) return;
    const filesFolderRef = ref(storage, `tweetImage/${ImageUpload.name}`);
    try {
      await uploadBytes(filesFolderRef, ImageUpload);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitTweet = async () => {
    try {
      await addDoc(tweetsCollectionRef, {
        text: tweetContent,
        authorId: auth?.currentUser?.uid,
        date: new Date().toLocaleString(),
        authorName: auth?.currentUser?.displayName,
        authorNickname: nickname.current,
        likedBy: [],
        // replies: [],
        isAReply: false,
        parentTweet: null,
      });
      getAllTweets();
      uploadFile();
    } catch (err) {
      console.error(err);
    }
  };

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
    console.log(getLikes?.data()?.likedBy);

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
    <div className="min-h-screen bg-slate-600 dark:bg-zinc-800 min-w-[50%] text-white">
      <div className="grid grid-rows-2">
        <div className="font-bold text-xl p-3">Home {user && user}</div>
        <div className="grid grid-cols-2 text-center border-b-[1px] border-slate-800 items-center">
          <div className="font-bold">For you</div>
          <div>Following</div>
        </div>
      </div>
      <div className="flex p-4 gap-3">
        <div>Img</div>
        <div className="flex flex-col">
          <input
            className="bg-transparent ring-2"
            placeholder="What's happening?"
            onChange={(e) => setTweetContent(e.target.value)}
          ></input>

          <div className="flex justify-between">
            <div>
              <input
                type="file"
                className="text-xs"
                onChange={(e) => setImageUpload(e.target.files[0])}
                // FYI: SHOULD BE ABLE TO UPLOAD MULTIPLE IMAGES, NOT JUST 1
              ></input>
            </div>
            <button onClick={onSubmitTweet}>Tweet</button>
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
