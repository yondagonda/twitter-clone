'use client';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, useRef } from 'react';
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

export default function Home() {
  app; // re-initialises firebase
  const auth = getAuth();
  // console.log(auth?.currentUser?.photoURL); // USE FOR USER THUMBNAIL LATER
  const nickname = useRef('');

  // const usersCollectionRef = collection(db, 'users'); // holds all users
  // const registerUser = async () => {
  //   try {
  //     await addDoc(usersCollectionRef, {
  //       userId: auth?.currentUser?.uid,
  //       userName: auth?.currentUser?.displayName,
  //       userNickname: nickname.current,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`User signed in: ${user.uid}`);
        console.log(user.displayName);
        const nameSplit = user.displayName?.split(' ').join('');
        nickname.current = `${nameSplit}3425`;
        // registerUser();
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
        commentedBy: [],
      });
      getAllTweets();
      uploadFile();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTweet = async (e, tweet: any) => {
    e.preventDefault();

    const tweetsDocRef = doc(db, 'tweets', tweet.id);
    await deleteDoc(tweetsDocRef);
    getAllTweets();
  };

  const likeTweet = async (e, tweet) => {
    e.preventDefault();
    const updateRef = doc(db, 'tweets', tweet.id);
    const likeRef = doc(db, 'tweets', tweet.id);
    const getLikes = await getDoc(likeRef);
    console.log(getLikes?.data()?.likedBy);

    const likesSoFar = getLikes?.data()?.likedBy;
    if (likesSoFar.includes(auth?.currentUser?.uid)) {
      await updateDoc(updateRef, {
        likedBy: arrayRemove(auth?.currentUser?.uid),
      });
    } else {
      await updateDoc(updateRef, {
        likedBy: arrayUnion(auth?.currentUser?.uid),
      });
    }
    getAllTweets();
  };

  const user = auth?.currentUser?.displayName;

  return (
    <div className="min-h-screen bg-blue-200 dark:bg-zinc-800 min-w-[50%]">
      <div className="font-bold text-xl p-3">Home {user && user}</div>
      <div className="flex p-4">
        <div>Img</div>
        <div className="flex flex-col">
          <input
            placeholder="What's happening?"
            onChange={(e) => setTweetContent(e.target.value)}
          ></input>

          <div className="flex justify-between">
            <div>
              <input
                type="file"
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
