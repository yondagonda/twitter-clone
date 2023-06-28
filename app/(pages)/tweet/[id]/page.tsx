/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable no-use-before-define */

'use client';

import { useEffect, useState, useContext, useRef } from 'react';
import {
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
import { parse, toDate } from 'date-fns';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInHours from 'date-fns/differenceInHours';
import LikesModal from '@/app/components/LikesModal.tsx';
import ImageModal from '@/app/components/ImageModal.tsx';
import useAutosizeTextArea from '@/app/components/useAutoSizeTextArea.tsx';
import { useRouter } from 'next/navigation';
import displayMiniMenuModal from '@/app/components/displayMiniMenuModal.tsx';
import { HelloContext } from '../../layout.tsx';

export default function TweetPage({ params }: any) {
  const router = useRouter();
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

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const onSubmitReply = async (receivingTweet: any) => {
    setReplyInput('');
    document.querySelector('.replyingtodropdown')?.classList.add('hidden');
    document.querySelector('.flexcol')?.classList.remove('flex-col');

    const docRef = doc(db, 'tweets', receivingTweet.id);
    await updateDoc(docRef, {
      replies: increment(1),
    }); // increments replies + 1

    const commentDetails = {
      text: replyInput,
      authorId: auth?.currentUser?.uid,
      date: new Date().toLocaleString('en-GB', options),
      authorName: auth?.currentUser?.displayName,
      authorNickname: nickname.current,
      likedBy: [],
      replies: 0,
      image: { imageId: '', imageUrl: '' },
      isAReply: true,
      parentTweet: receivingTweet.id,
      parentTweetNickname: receivingTweet.authorNickname,
      authorProfileImg: auth?.currentUser?.photoURL,
    };

    const tweetsCollectionRef = collection(db, 'tweets');
    await addDoc(tweetsCollectionRef, commentDetails); // ensures reply gets added as a document first
    getAllTweets();
    getTweetData();
  };

  const deleteTweet = async (e: any, tweet: any) => {
    e.preventDefault();
    const docRef = doc(db, 'tweets', displayTweet.id);
    await updateDoc(docRef, {
      replies: increment(-1),
    });

    const tweetsDocRef = doc(db, 'tweets', tweet.id);
    await deleteDoc(tweetsDocRef);
    getAllTweets();
    getTweetData();
  };

  const deleteParentTweet = async (e: any, tweet: any) => {
    // delete all the replies on parent tweet too?
    console.log('deleting parent');
    e.preventDefault();
    const tweetsDocRef = doc(db, 'tweets', tweet.id);
    await deleteDoc(tweetsDocRef);
    getAllTweets();
    getTweetData();
    window.history.back();
  };

  useEffect(() => {
    getTweetData();
    getAllTweets();
  }, []);

  const [showLikesModal, setShowLikesModal] = useState<boolean>(false);

  const [showImageModal, setShowImageModal] = useState({
    url: '',
    show: false,
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, replyInput);

  useEffect(() => {
    const replytweetinput = document.querySelector('.replytweetinput');
    if (replytweetinput) {
      replytweetinput.addEventListener('mousedown', openInput);
    }
    return () => {
      if (replytweetinput) {
        replytweetinput.removeEventListener('mousedown', openInput);
      }
    };
  }, [displayTweet]);

  const openInput = () => {
    document.querySelector('.replyingtodropdown')?.classList.remove('hidden');
    document.querySelector('.flexcol')?.classList.add('flex-col');
  };

  return (
    <div
      className="min-h-screen border-x border-[#2f3336] text-[#e7e9ea]
      min-w-[270px] w-full max-w-[600px] flex flex-col"
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
            className="fill-[#e7e9ea]"
          >
            <g>
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
            </g>
          </svg>
        </button>
        <div className="font-bold text-xl">
          {displayTweet?.parentTweet! == null ? 'Tweet' : 'Replies'}
        </div>
      </div>

      {displayTweet?.parentTweet !== null &&
      displayTweet?.parentTweet !== undefined ? (
        <div className="">
          <div className="border-l-2 border-[#393733] h-12 absolute ml-[34.5px] "></div>
        </div>
      ) : null}

      <div className="px-4 pt-4 pb-2 w-full border-b-[1px] border-[#393733]">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Link
              className="h-0 z-[1]"
              href={`/user/${displayTweet?.authorNickname}`}
            >
              {displayTweet?.authorProfileImg && (
                <img
                  src={`${displayTweet.authorProfileImg}`}
                  className="h-10 rounded-full max-w-[40px] w-full object-cover hover:brightness-[.85] duration-200"
                  alt="profile photo"
                />
              )}
            </Link>
            <div>
              <Link
                href={`/user/${displayTweet?.authorNickname}`}
                className="font-bold text-[#e7e9ea] hover:underline cursor-pointer"
              >
                {displayTweet?.authorName}
              </Link>
              <div className="text-sm text-[#71767b]">
                {displayTweet?.authorNickname && (
                  <>@{displayTweet?.authorNickname}</>
                )}
              </div>
            </div>
          </div>
          <button
            className="h-fit group selected p-2 hover:bg-[#02111b] rounded-full duration-200"
            onClick={(e) => {
              e.preventDefault();
              displayMiniMenuModal(e, displayTweet, deleteParentTweet, router);
            }}
            data-id={0}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={20}
              width={20}
              className="fill-[#71767b] group-hover:fill-[#1d9bf0]"
            >
              <g>
                <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
              </g>
            </svg>
          </button>
        </div>
        <div className="flex flex-col mb-3">
          <div className="py-4 text-lg break-all">{displayTweet?.text}</div>
          {displayTweet?.image.imageId !== '' && (
            <div className="max-w-[90%] ">
              {displayTweet?.image.imageId && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowImageModal({
                      url: displayTweet.image.imageUrl,
                      show: true,
                    });
                  }}
                  className="max-w-[60%] mb-2 relative"
                >
                  <Image
                    width={0}
                    height={0}
                    sizes="100vw"
                    src={displayTweet?.image?.imageUrl}
                    alt="image"
                    className="rounded-xl w-auto h-auto mb-3 border border-[#2f3336]"
                  />
                </button>
              )}
            </div>
          )}
          <div className="text-sm text-[#71767b]">{displayTweet?.date}</div>
        </div>
        <div className=" flex justify-start gap-2 sm:gap-6 text-sm border-y-[1px] border-[#2f3336] py-3">
          <div className="flex gap-1">
            <div>0</div>
            <div className="text-[#71767b]">Retweets</div>
          </div>
          <div className="flex gap-1">
            <div>0</div>
            <div className="text-[#71767b]">Quotes</div>
          </div>
          <button
            onClick={() => setShowLikesModal(true)}
            className="flex gap-1 group cursor-pointer"
          >
            <div>{displayTweet?.likedBy.length}</div>
            <div className="group-hover:underline text-[#71767b] decoration-white">
              Likes
            </div>
          </button>
          <div className="flex gap-1">
            <div>0</div>
            <div className="text-[#71767b]">Bookmarks</div>
          </div>
          {showLikesModal && (
            <div className="bg-blue-300/20 fixed top-0 left-0 right-0 bottom-0 z-[10]">
              <LikesModal
                showLikesModal={showLikesModal}
                setShowLikesModal={setShowLikesModal}
                likedBy={displayTweet.likedBy}
              />
            </div>
          )}
        </div>
        <div className="flex icon justify-around py-3">
          <div>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={26}
              width={26}
              className="fill-[#71767b]"
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
              className="fill-[#71767b]"
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
                className="fill-[#71767b]"
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
              className="fill-[#71767b]"
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
              className="fill-[#71767b]"
            >
              <g>
                <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
              </g>
            </svg>
          </div>
        </div>
        {displayTweet?.parentTweet === null && (
          <div className="border-t-[1px] pt-3 pb-4 border-[#2f3336]">
            <div className="replyingtodropdown hidden w-full pl-14 pt-1">
              <div className="">
                <span className="text-[#71767b]">Replying to</span> {''}
                <span className="text-[#1d9bf0]">
                  @{displayTweet.authorNickname}
                </span>
              </div>
            </div>

            <div className="flex items-center flexcol">
              <div className="flex gap-4 pt-1 pb-2 items-center w-full align-start">
                <div className="">
                  <img
                    src={`${auth?.currentUser?.photoURL}`}
                    className="h-10 max-w-[40px] min-w-[40px] object-cover rounded-full"
                    alt="profile photo"
                  />
                </div>
                <textarea
                  maxLength={140}
                  rows={1}
                  ref={textAreaRef}
                  className={`bg-transparent w-full outline-none text-xl replytweetinput 
                     resize-none pb-1 placeholder:text-[#71767b]`}
                  placeholder="Tweet your reply!"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                ></textarea>
              </div>
              <div className="w-full text-end pt-1">
                <button
                  className={`px-5 rounded-3xl bg-[#1d9bf0] font-bold h-9 text-white ${
                    replyInput !== ''
                      ? 'pointer-events-auto brightness-100'
                      : 'pointer-events-none brightness-50'
                  }`}
                  onClick={() => onSubmitReply(displayTweet)}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        {allTweets.map((tweet: any, index) => {
          if (tweet.isAReply && tweet.parentTweet === displayTweet.id) {
            return (
              <div className="relative" key={tweet.id}>
                <div
                  className="flex gap-3 pt-3 pb-1 pl-3 border-b-[1px] border-[#2f3336] overflow-x-hidden 
                 relative"
                >
                  <Link className="h-0" href={`/user/${tweet.authorNickname}`}>
                    <img
                      src={`${tweet?.authorProfileImg}`}
                      className="h-10 rounded-full max-w-[40px] min-w-[40px] w-full object-cover 
                      hover:brightness-[.85] duration-200"
                      alt="profile photo"
                    />
                  </Link>
                  <Link
                    href={`/tweet/${tweet.id}`}
                    className="flex gap-3 w-full relative pr-9"
                  >
                    <div className="w-full">
                      <div className="flex gap-1 items-center">
                        <Link
                          href={`/user/${tweet.authorNickname}`}
                          className="font-bold text-[15.2px] hover:underline"
                        >
                          {tweet.authorName}
                        </Link>
                        <div className="text-[#71767b] text-[15.2px] truncate">
                          @{tweet.authorNickname}
                        </div>
                        <span className="text-[#71767b] px-0.5">·</span>
                        <div className="text-[#71767b] text-[15.2px] truncate">
                          {tweet.date}
                        </div>
                      </div>
                      <div className="pb-1 break-all text-[15.2px]">
                        {tweet.text}
                      </div>
                      <div className="flex justify-around items-center">
                        <button className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            height={18}
                            width={18}
                            className="fill-[#71767b]"
                          >
                            <g>
                              <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                            </g>
                          </svg>
                          {tweet.replies === 0 ? (
                            ''
                          ) : (
                            <span className="text-[13px]">{tweet.replies}</span>
                          )}
                        </button>
                        <div>
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            height={18}
                            width={18}
                            className="fill-[#71767b]"
                          >
                            <g>
                              <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
                            </g>
                          </svg>
                        </div>

                        <button
                          className="text-sm flex gap-2 group items-center"
                          onClick={(e) => likeTweet(e, tweet)}
                        >
                          {tweet.likedBy.includes(auth?.currentUser?.uid) ? (
                            <div className="p-2 rounded-full group-hover:bg-[#250313] duration-200">
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                height={18}
                                width={18}
                                fill="rgb(249, 24, 128)"
                              >
                                <g>
                                  <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                                </g>
                              </svg>
                            </div>
                          ) : (
                            <div
                              className="p-2 rounded-full group-hover:bg-[#250313] 
                          group-hover:fill-[#f91880] fill-[#71767b] duration-200"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                height={18}
                                width={18}
                              >
                                <g>
                                  <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                                </g>
                              </svg>
                            </div>
                          )}
                          {tweet.likedBy.length !== 0 && (
                            <div className="text-[#71767b] text-[13px] group-hover:text-[#f91880]">
                              {tweet.likedBy.length}
                            </div>
                          )}
                        </button>
                        <div>
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            height={18}
                            width={18}
                            className="fill-[#7a717b]"
                          >
                            <g>
                              <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                <button
                  className="h-fit group selected p-2 hover:bg-[#02111b] rounded-full duration-200
                  absolute top-1 right-1.5"
                  onClick={(e) => {
                    e.preventDefault();
                    displayMiniMenuModal(e, tweet, deleteTweet, router);
                  }}
                  data-id={index}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    height={20}
                    width={20}
                    className="fill-[#71767b] group-hover:fill-[#1d9bf0]"
                  >
                    <g>
                      <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                    </g>
                  </svg>
                </button>
              </div>
            );
          }
        })}
      </div>
      {showImageModal.show && (
        <div className="bg-blue-300/20 fixed top-0 left-0 right-0 bottom-0 z-[10]">
          <ImageModal
            setShowImageModal={setShowImageModal}
            showImageModal={showImageModal}
          />
        </div>
      )}
    </div>
  );
}
