/* eslint-disable @next/next/no-img-element */
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
  increment,
} from 'firebase/firestore';
import { db, auth } from '@/app/config/firebase.tsx';
import Image from 'next/image';
import Link from 'next/link';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parseISO from 'date-fns/parseISO';
import { parse, toDate } from 'date-fns';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import isToday from 'date-fns/isToday';
import differenceInHours from 'date-fns/differenceInHours';
import { HelloContext } from '../../layout.tsx';

export default function TweetPage({ params }: any) {
  const [displayTweet, setDisplayTweet] = useState<any>();

  const getTweetData = async () => {
    try {
      const docRef = doc(db, 'tweets', params.id);
      const getTweet = await getDoc(docRef);

      const idAddedData = { ...getTweet.data(), id: getTweet.id }; // rmb to add id as a property
      if (getTweet.exists()) {
        const unformattedDate = idAddedData.date;
        const parsedDate = parse(
          unformattedDate,
          'dd/MM/yyyy, HH:mm:ss',
          new Date()
        );
        const formattedDate = format(parsedDate, 'h:mm a · MMM d, yyyy');
        console.log(formattedDate);
        const finalTweetFormat = { ...idAddedData, date: formattedDate };
        console.log(finalTweetFormat);
        setDisplayTweet(finalTweetFormat);
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
      const sortedTweets = filteredData.sort((a, b) =>
        a.date.localeCompare(b.date)
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
      setAllTweets(DateSortedTweets);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitReply = async (receivingTweet: any) => {
    const docRef = doc(db, 'tweets', receivingTweet.id);
    await updateDoc(docRef, {
      replies: increment(1),
    }); // increments replies + 1

    const commentDetails = {
      text: replyInput,
      authorId: auth?.currentUser?.uid,
      date: new Date().toLocaleString(),
      authorName: auth?.currentUser?.displayName,
      authorNickname: nickname.current,
      likedBy: [],
      replies: 0,
      image: { imageId: '', imageUrl: '' },
      isAReply: true,
      parentTweet: receivingTweet.id,
      authorProfileImg: auth?.currentUser?.photoURL,
    };

    const tweetsCollectionRef = collection(db, 'tweets');
    await addDoc(tweetsCollectionRef, commentDetails); // ensures reply gets added as a document first
    getAllTweets();
    getTweetData();
    // uploadFile();
  };

  const deleteTweet = async (e: any, tweet: any) => {
    e.preventDefault();
    const docRef = doc(db, 'tweets', displayTweet.id); // setting this to displaytweet means
    // this will not work when/if we add in threaded commenting (comments on replies)??
    await updateDoc(docRef, {
      replies: increment(-1),
    });

    const tweetsDocRef = doc(db, 'tweets', tweet.id);
    await deleteDoc(tweetsDocRef);
    getAllTweets();
    getTweetData();
  };

  useEffect(() => {
    getTweetData();
    getAllTweets();
    console.log(allTweets);
  }, []);

  return (
    <div
      className="min-h-screen bg-slate-600 text-white
     dark:bg-zinc-800 max-w-[47%] w-full flex flex-col"
    >
      <div className="flex gap-5 h-14 p-5 items-center">
        <button
          className="cursor-pointer"
          onClick={() => window.history.back()}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            height={22}
            width={22}
            style={{ fill: 'white' }}
          >
            <g>
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
            </g>
          </svg>
        </button>
        <div className="font-bold text-xl">Tweet</div>
      </div>

      <div className="p-4">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Link
              className="h-0"
              href={`/user/${displayTweet?.authorNickname}`}
            >
              <img
                src={`${displayTweet?.authorProfileImg}`}
                className="h-8 rounded-full min-w-[32px]"
                alt="profile photo"
              />
            </Link>
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
          {displayTweet?.image.imageId !== '' && (
            <div className="max-w-[50%] ">
              {displayTweet?.image.imageId && (
                <Image
                  width={0}
                  height={0}
                  sizes="100vw"
                  src={displayTweet?.image?.imageUrl}
                  alt="image"
                  className="rounded-xl w-auto h-auto mb-3"
                />
              )}
            </div>
          )}
          <div className="text-sm text-slate-400">{displayTweet?.date}</div>
        </div>
        <div className="flex justify-start gap-6 text-sm border-y-[1px] border-zinc-800 py-2">
          <div>Retweets</div>
          <div>Quotes</div>
          <div> {displayTweet?.likedBy.length} Likes</div>
          <div>Bookmarks</div>
        </div>
        <div className="flex icon justify-evenly py-2">
          <div className="flex">
            {/* {displayTweet?.replies} */}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={26}
              width={26}
              className="fill-slate-200"
            >
              <g>
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
              </g>
            </svg>
          </div>
          <div>Retweet</div>
          <button onClick={(e) => likeTweet(e, displayTweet)}>
            {displayTweet?.likedBy.includes(auth?.currentUser?.uid) ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                height={24}
                width={24}
                fill="rgb(249, 24, 128)"
              >
                <g>
                  <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                </g>
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                height={24}
                width={24}
                className="fill-slate-100"
              >
                <g>
                  <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                </g>
              </svg>
            )}
          </button>
          <div>Bookmark</div>
          <div>Share</div>
        </div>
        <div className="flex gap-4 border-t-[1px] border-zinc-800 py-2">
          <div>
            <img
              src={`${auth?.currentUser?.photoURL}`}
              className="h-8 rounded-full"
              alt="profile photo"
            />
          </div>
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
                <Link className="h-0" href={`/user/${tweet.authorNickname}`}>
                  <img
                    src={`${tweet?.authorProfileImg}`}
                    className="h-8 rounded-full min-w-[32px]"
                    alt="profile photo"
                  />
                </Link>
                <div>
                  <div className="flex gap-0.5">
                    <div className="font-bold ">{tweet.authorName}</div>
                    <div>@{tweet.authorNickname}</div>
                    <span>·</span>
                    <div className="text-sm text-slate-400">{tweet.date}</div>
                  </div>
                  <div className="">{tweet.text}</div>
                  <div className="flex justify-evenly">
                    <button className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        height={20}
                        width={20}
                        className="fill-slate-200"
                      >
                        <g>
                          <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                        </g>
                      </svg>
                      {tweet.replies}
                    </button>
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
