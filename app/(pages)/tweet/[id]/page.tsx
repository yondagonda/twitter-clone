/* eslint-disable no-use-before-define */

'use client';

import { useEffect, useState, useContext } from 'react';
import {
  // getDocs,
  // collection,
  getDoc,
  doc,
  arrayRemove,
  arrayUnion,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '@/app/config/firebase.tsx';
import { HelloContext } from '../../layout.tsx';

export default function TweetPage({ params }: any) {
  const [displayTweet, setDisplayTweet] = useState<any>();

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

  const likeTweet = async (e: any, tweet: any) => {
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
    getAllTweets(); // performance costs could get v high with this...
  };

  const [replyInput, setReplyInput] = useState('');
  const { nickname } = useContext(HelloContext);
  const [allTweets, setAllTweets] = useState([]);

  const getAllTweets = async () => {
    try {
      const tweetsCollectionRef = collection(db, 'tweets');
      const data = await getDocs(tweetsCollectionRef);
      const filteredData: any = data.docs.map((document) => ({
        ...document.data(),
        id: document.id,
      }));
      setAllTweets(filteredData);
      console.log(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitReply = async (receivingTweet: any) => {
    const commentDetails = {
      text: replyInput,
      authorId: auth?.currentUser?.uid,
      date: new Date().toLocaleString(),
      authorName: auth?.currentUser?.displayName,
      authorNickname: nickname.current,
      likedBy: [],
      // replies: [],
      isAReply: true,
      parentTweet: receivingTweet.id,
    };

    const tweetsCollectionRef = collection(db, 'tweets'); // holds all tweets
    await addDoc(tweetsCollectionRef, commentDetails); // ensures reply gets added as a document first
    getAllTweets();
    // uploadFile();
  };

  const deleteTweet = async (e: any, tweet: any) => {
    e.preventDefault();

    const tweetsDocRef = doc(db, 'tweets', tweet.id);
    await deleteDoc(tweetsDocRef);
    getAllTweets();
  };

  useEffect(() => {
    getTweetData();
    getAllTweets();
    console.log(allTweets);
  }, []);

  return (
    <div
      className="min-h-screen bg-slate-600 text-white
     dark:bg-zinc-800 min-w-[50%] flex flex-col"
    >
      <div className="flex gap-5 h-14 p-5">
        <div className="cursor-pointer" onClick={() => window.history.back()}>
          Back
        </div>
        <div className="font-bold text-xl">Tweet</div>
      </div>

      <div className="p-4">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <div>img</div>
            <div>
              <div className="font-bold text-white">
                {displayTweet?.authorName}
              </div>
              <div className="text-sm">{displayTweet?.authorNickname}</div>
            </div>
          </div>
          <div>popup</div>
        </div>
        <div className="flex flex-col">
          <div className="py-4 text-lg">{displayTweet?.text}</div>
          <div className="text-sm text-slate-400">{displayTweet?.date}</div>
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
            <input
              className="bg-transparent ring-2"
              placeholder="Tweet your reply!"
              onChange={(e) => setReplyInput(e.target.value)}
            ></input>
            <button onClick={() => onSubmitReply(displayTweet)}>Reply</button>
          </div>
        </div>
      </div>

      <div>
        {allTweets.map((tweet: any) => {
          if (tweet.isAReply && tweet.parentTweet === displayTweet.id) {
            return (
              <div
                key={tweet.id}
                className="flex gap-3 p-4 border-t-[1px] border-zinc-800"
              >
                <div>img </div>
                <div>
                  <div className="flex gap-0.5">
                    <div className="font-bold ">{tweet.authorName}</div>
                    <div>@{tweet.authorNickname}</div>
                    <span>·</span>
                    <div className="text-sm text-slate-400">{tweet.date}</div>
                  </div>
                  <div className="">{tweet.text}</div>
                  <div className="flex justify-evenly">
                    <button>Comment</button>
                    <button
                      className="text-sm"
                      onClick={(e) => likeTweet(e, tweet)}
                    >
                      {tweet.likedBy.length} Like
                    </button>
                  </div>

                  {auth?.currentUser?.uid === tweet.authorId && (
                    <button
                      className="text-sm"
                      onClick={(e) => deleteTweet(e, tweet)}
                    >
                      Delete Tweet
                    </button>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
