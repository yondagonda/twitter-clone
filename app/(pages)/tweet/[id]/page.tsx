'use client';

import { useEffect, useState } from 'react';
import {
  getDocs,
  collection,
  getDoc,
  doc,
  arrayRemove,
  arrayUnion,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '@/app/config/firebase.tsx';
import { useSearchParams } from 'next/navigation';

export default function TweetPage({ params }: any) {
  const [displayTweet, setDisplayTweet] = useState<any>();

  const likeTweet = async (e, tweet) => {
    e.preventDefault();
    console.log(tweet);
    const updateRef = doc(db, 'tweets', tweet.id);
    const likeRef = doc(db, 'tweets', tweet.id);
    const getAllLikes = await getDoc(likeRef);

    const likesSoFar = getAllLikes?.data()?.likedBy;
    if (likesSoFar.includes(auth?.currentUser?.uid)) {
      await updateDoc(updateRef, {
        likedBy: arrayRemove(auth?.currentUser?.uid),
      });
    } else {
      await updateDoc(updateRef, {
        likedBy: arrayUnion(auth?.currentUser?.uid),
      });
    }
    getTweetData();
    // getReplies() will be needed soon??
  };

  const getTweetData = async () => {
    try {
      const docRef = doc(db, 'tweets', params.id);
      const getTweet = await getDoc(docRef);

      const idAddedData = { ...getTweet.data(), id: getTweet.id }; // rmb to add id as a property
      if (getTweet.exists()) {
        setDisplayTweet(idAddedData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getTweetData();
  }, []);

  return (
    <div
      className="min-h-screen 
    bg-blue-200 dark:bg-zinc-800 min-w-[50%] p-5 flex flex-col"
    >
      <div className="flex gap-5 h-14">
        <div className="cursor-pointer" onClick={() => window.history.back()}>
          Back
        </div>
        <div className="font-bold text-xl">Tweet</div>
      </div>

      <div>
        <div className="flex justify-between">
          <div className="flex gap-3">
            <div>img</div>
            <div>
              <div className="font-bold">{displayTweet?.authorName}</div>
              <div className="text-sm">{displayTweet?.authorNickname}</div>
            </div>
          </div>
          <div>popup</div>
        </div>
        <div className="flex flex-col">
          <div className="">{displayTweet?.text}</div>
          <div className="text-sm">{displayTweet?.date}</div>
        </div>
        <div className="flex justify-start gap-6 text-sm border-y-[1px] border-zinc-800 py-2">
          <div>Retweets</div>
          <div>Quotes</div>
          <div> {displayTweet?.likedBy.length} Likes</div>
          <div>Bookmarks</div>
        </div>
        <div className="flex icon justify-evenly py-2">
          <div>Comments</div>
          <div>Retweet</div>
          <button onClick={(e) => likeTweet(e, displayTweet)}>Like</button>
          <div>Bookmark</div>
          <div>Share</div>
        </div>
        <div className="flex gap-4 border-t-[1px] border-zinc-800 py-2">
          <div>img</div>
          <div className="flex gap-10">
            <input placeholder="Tweet your reply!"></input>
            <div>Reply</div>
          </div>
        </div>
      </div>
    </div>
  );
}
