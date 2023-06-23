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
import LikesModal from '@/app/components/LikesModal.tsx';
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
        const finalTweetFormat = { ...idAddedData, date: formattedDate };
        setDisplayTweet(finalTweetFormat);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const likeTweet = async (e: any, tweet: any) => {
    e.preventDefault();
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

  const [showLikesModal, setShowLikesModal] = useState(false);

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
              <div className="text-sm text-slate-300">
                @{displayTweet?.authorNickname}
              </div>
            </div>
          </div>
          <div>popup</div>
        </div>
        <div className="flex flex-col mb-3">
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
        <div className="flex justify-start gap-6 text-sm border-y-[1px] border-zinc-800 py-3">
          <div className="flex gap-1">
            <div>0</div>
            <div className="text-slate-400">Retweets</div>
          </div>
          <div className="flex gap-1">
            <div>0</div>
            <div className="text-slate-400">Quotes</div>
          </div>
          <button
            onClick={() => setShowLikesModal(true)}
            className="flex gap-1 group cursor-pointer"
          >
            <div>{displayTweet?.likedBy.length}</div>
            <div className="group-hover:underline text-slate-400 decoration-white">
              Likes
            </div>
          </button>
          <div className="flex gap-1">
            <div>0</div>
            <div className="text-slate-400">Bookmarks</div>
          </div>
          {showLikesModal && (
            <div className="bg-blue-300/20 fixed top-0 left-0 right-0 bottom-0 z-[1]">
              <LikesModal
                showLikesModal={showLikesModal}
                setShowLikesModal={setShowLikesModal}
                likedBy={displayTweet.likedBy}
              />
            </div>
          )}
        </div>
        <div className="flex icon justify-evenly py-3">
          <div>
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
          <div>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={26}
              width={26}
              className="fill-slate-200"
            >
              <g>
                <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
              </g>
            </svg>
          </div>
          <button onClick={(e) => likeTweet(e, displayTweet)}>
            {displayTweet?.likedBy.includes(auth?.currentUser?.uid) ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                height={26}
                width={26}
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
                height={26}
                width={26}
                className="fill-slate-100"
              >
                <g>
                  <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                </g>
              </svg>
            )}
          </button>
          <div>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={26}
              width={26}
              className="fill-slate-200"
            >
              <g>
                <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
              </g>
            </svg>
          </div>
          <div>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={26}
              width={26}
              className="fill-slate-200"
            >
              <g>
                <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
              </g>
            </svg>
          </div>
        </div>
        <div className="flex gap-4 border-t-[1px] border-zinc-800 pt-3 items-center">
          <div>
            <img
              src={`${auth?.currentUser?.photoURL}`}
              className="h-8 rounded-full"
              alt="profile photo"
            />
          </div>
          <div className="flex gap-10">
            <input
              className="bg-transparent ring-2 px-4 py-4"
              placeholder="Tweet your reply!"
              onChange={(e) => setReplyInput(e.target.value)}
            ></input>
            <button
              className="px-4 py-0.5 rounded-3xl bg-blue-400 h-10"
              onClick={() => onSubmitReply(displayTweet)}
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      <div>
        {allTweets.map((tweet: any, index) => {
          if (tweet.isAReply && tweet.parentTweet === displayTweet.id) {
            return (
              <div
                key={tweet.id}
                className="flex gap-3 p-4 border-t-[1px]  border-zinc-800"
              >
                <Link className="h-0" href={`/user/${tweet.authorNickname}`}>
                  <img
                    src={`${tweet?.authorProfileImg}`}
                    className="h-8 rounded-full min-w-[32px]"
                    alt="profile photo"
                  />
                </Link>
                <div className="w-full">
                  <div className="flex gap-1 items-center">
                    <div className="font-bold ">{tweet.authorName}</div>
                    <div className="text-slate-300">
                      @{tweet.authorNickname}
                    </div>
                    <span>·</span>
                    <div className="text-sm text-slate-400">{tweet.date}</div>
                  </div>
                  <div className="">{tweet.text}</div>
                  <div className="flex justify-evenly items-center">
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
                      {tweet.replies === 0 ? '' : tweet.replies}
                    </button>
                    <div>
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        height={20}
                        width={20}
                        className="fill-slate-200"
                      >
                        <g>
                          <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
                        </g>
                      </svg>
                    </div>
                    <button
                      className="text-sm flex gap-2"
                      onClick={(e) => likeTweet(e, tweet)}
                    >
                      {tweet.likedBy.includes(auth?.currentUser?.uid) ? (
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          height={20}
                          width={20}
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
                          height={20}
                          width={20}
                          className="fill-slate-100"
                        >
                          <g>
                            <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                          </g>
                        </svg>
                      )}
                      {tweet.likedBy.length}
                    </button>
                  </div>
                </div>
                {auth?.currentUser?.uid === tweet.authorId && (
                  <button
                    className="text-sm right-0"
                    onClick={(e) => deleteTweet(e, tweet)}
                  >
                    Del
                  </button>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
