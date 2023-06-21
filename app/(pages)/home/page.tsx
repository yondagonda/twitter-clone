/* eslint-disable @next/next/no-img-element */

'use client';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, useRef, useContext, use } from 'react';
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
import { uploadBytes, ref, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { db, app, storage } from '../../config/firebase.tsx';
import { HelloContext } from '../layout.tsx';

export default function Home() {
  app; // re-initialises firebase
  const auth = getAuth();
  const { nickname } = useContext(HelloContext);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`User signed in: ${user.uid}`);
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
    setImageUpload();
    setImagePreview('');
    setTweetContent('');
    document.getElementById('pickimage').value = ''; // allows onchange to fire every time
    if (imageUpload === undefined) {
      console.log('nothing here');
      setImageURL('empty');
      setImageID('empty');
      return;
    }
    console.log(imageUpload);
    const imageName = v4() + imageUpload.name;
    console.log(imageName);

    const filesFolderRef = ref(storage, `tweetImage/${imageName}`);
    const snapshot = await uploadBytes(filesFolderRef, imageUpload);
    const url = await getDownloadURL(snapshot.ref);

    console.log(url);
    setImageURL(url);
    setImageID(imageName);
  };

  useEffect(() => {
    if (imageURL) {
      onSubmitTweet(); // this fixed our issues lol
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
    <div className="min-h-screen bg-slate-600 dark:bg-zinc-800 w-full max-w-[47%] text-white">
      <div className="grid grid-rows-2">
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
            className="h-8 rounded-full"
            alt="profile photo"
          />
        </div>
        <div className="flex flex-col">
          <input
            className="bg-transparent ring-2"
            placeholder="What's happening?"
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
          ></input>

          <div className="flex justify-between">
            <div>
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
              {imagePreview && <div className="">{renderPreview()}</div>}
            </div>
            <button onClick={uploadFile}>Tweet</button>
          </div>
        </div>
      </div>

      <Tweetlist
        auth={auth}
        allTweets={allTweets}
        deleteTweet={deleteTweet}
        likeTweet={likeTweet}
        // imageList={imageList}
      />
    </div>
  );
}
