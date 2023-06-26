/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-use-before-define */
/* eslint-disable @next/next/no-img-element */

'use client';

import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  doc,
  deleteDoc,
  increment,
} from 'firebase/firestore';
import { db, auth } from '@/app/config/firebase.tsx';
import { useEffect, useState, useContext } from 'react';
import Tweetlist from '@/app/components/Tweetlist';
import { TweetRepliesList } from '@/app/components/TweetRepliesList.tsx';
import { parse, toDate } from 'date-fns';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInHours from 'date-fns/differenceInHours';
import Link from 'next/link';
import { HelloContext } from '../../layout.tsx';

export default function UserPage({ params }: any) {
  const [profileData, setProfileData] = useState<any>({});
  const usersCollectionRef = collection(db, 'users');

  const { nickname } = useContext(HelloContext);

  const getProfileData = async () => {
    const { id } = params;
    const data = await getDocs(usersCollectionRef);
    const filteredData = data.docs.map((document) => {
      if (id === document.data().userNickname) {
        return { ...document.data(), docId: document.id };
      }
    });
    const profData = filteredData.filter((user) => user !== undefined);
    setProfileData(profData[0]);
  };

  const [usersTweets, setUsersTweets] = useState([]);
  const tweetsCollectionRef = collection(db, 'tweets'); // holds all tweets

  const getAllUsersTweets = async () => {
    try {
      const data = await getDocs(tweetsCollectionRef);

      let filteredData = data.docs.map((document) => {
        if (document.data().authorNickname === params.id) {
          return { ...document.data(), id: document.id };
        }
      });
      filteredData = filteredData.filter((tweet) => tweet !== undefined);
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
      setUsersTweets(DateSortedTweets);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTweet = async (e: any, tweet: any) => {
    e.preventDefault();
    const parentTweetDocRef = doc(db, 'tweets', tweet.parentTweet);
    await updateDoc(parentTweetDocRef, {
      replies: increment(-1),
    });

    const tweetsDocRef = doc(db, 'tweets', tweet.id);
    await deleteDoc(tweetsDocRef);
    getAllUsersTweets();
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
    getAllUsersTweets();
  };

  useEffect(() => {
    getProfileData();
    getAllUsersTweets();
  }, []);

  const onFollowClick = async (recipientDocId) => {
    console.log(`recipient docid: ${recipientDocId}`);

    const recipientRef = doc(db, 'users', recipientDocId);
    const getrecipientRef = await getDoc(recipientRef);
    const recipientFollowers = getrecipientRef?.data()?.followers;

    if (recipientFollowers.includes(auth?.currentUser?.uid)) {
      await updateDoc(recipientRef, {
        followers: arrayRemove(auth?.currentUser?.uid),
      });
      const recipientUserId = getrecipientRef?.data()?.userId;
      console.log(`recipient userid: ${recipientUserId}`);
      // need to remove recipients userid  in current users follwing list
      removeFromFollowing(recipientUserId);
    } else {
      await updateDoc(recipientRef, {
        followers: arrayUnion(auth?.currentUser?.uid),
      });
      // need to update current users follwing list now with the recipients userid
      addToFollowing(getrecipientRef?.data()?.userId);
    }
    getProfileData();
  };

  const addToFollowing = async (recipientUserId) => {
    console.log(
      `now add this userid to our current following list ${recipientUserId}`
    );
    const data = await getDocs(usersCollectionRef);
    const filteredData = data.docs.map(async (document) => {
      if (auth?.currentUser?.uid === document.data().userId) {
        const recipientRef = doc(db, 'users', document.id);
        await updateDoc(recipientRef, {
          following: arrayUnion(recipientUserId),
        });
      }
    });
    const profData = filteredData.filter((user) => user !== undefined);
    setProfileData(profData[0]);
  };

  const removeFromFollowing = async (recipientUserId) => {
    console.log(
      `now add this userid to our current following list ${recipientUserId}`
    );
    const data = await getDocs(usersCollectionRef);
    const filteredData = data.docs.map(async (document) => {
      if (auth?.currentUser?.uid === document.data().userId) {
        const recipientRef = doc(db, 'users', document.id);
        await updateDoc(recipientRef, {
          following: arrayRemove(recipientUserId),
        });
      }
    });
    const profData = filteredData.filter((user) => user !== undefined);
    setProfileData(profData[0]);
  };

  const renderFollowButton = () => {
    if (params.id === nickname.current) {
      return (
        <button
          className="py-1.5 px-5 rounded-3xl bg-black h-fit mt-6 text-[#e7e9ea]
       outline outline-[0.5px] outline-[#536471] font-bold text-sm "
        >
          Edit Profile
        </button>
      );
    }
    console.log(auth.currentUser); // unfollow button rendering jittery, store the state at earlier page?
    if (profileData.followers?.includes(auth?.currentUser?.uid)) {
      return (
        <button
          onClick={(e) => onFollowClick(profileData.docId)}
          className="py-2 px-6 rounded-3xl bg-black h-fit mt-6 text-[#e7e9ea] font-bold text-sm
          outline outline-[0.5px] outline-[#536471] "
          data-profile-nickname={params.id}
        >
          Unfollow
        </button>
      );
    }
    return (
      <button
        onClick={(e) => onFollowClick(profileData.docId)}
        className="py-2 px-6 rounded-3xl bg-[#eff3f4] h-fit mt-6 font-bold text-sm text-black"
        data-profile-nickname={params.id}
      >
        Follow
      </button>
    );
  };

  const [selectedTab, setSelectedTab] = useState('tweets');

  const repliesOnly = usersTweets.filter((tweet) => tweet.isAReply === true);

  return (
    <div
      className="min-h-screen border-x border-[#2f3336] border-w-[1px] min-w-[270px] w-full max-w-[600px]
     text-[#e7e9ea]"
    >
      <div className="h-16 flex gap-6 p-3 items-center">
        <button
          className="cursor-pointer"
          onClick={() => window.history.back()}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            height={22}
            width={22}
            className="fill-[#eff3f4]"
          >
            <g>
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
            </g>
          </svg>
        </button>
        <div className="text-xl font-bold ">{profileData.userName}</div>
      </div>
      <div className="">
        {/* <div className="text-2xl border-b-[1px]">bg Image here</div> */}
        <div className="h-24 bg-zinc-600"></div>
        <div className="">
          <div className="flex justify-between px-4">
            <div>
              <img
                className="rounded-full outline outline-black"
                src={profileData.userProfileImg}
                alt="profile photo"
              />
            </div>

            {renderFollowButton()}
          </div>
          <div className="p-4">
            <div className="font-bold text-2xl">{profileData.userName}</div>
            <div className="text-[#71767b]">@{profileData.userNickname}</div>
            <div className="py-4">This is the profile page description</div>
            <div className="flex gap-4 pb-1.5">
              {/* {profileData.location && (
                <div className="text-slate-300">Location </div>
              )} */}
              <div className="text-[#71767b] flex items-center gap-1">
                <div>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    width={20}
                    height={20}
                    className="fill-[#71767b] "
                  >
                    <g>
                      <path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path>
                    </g>
                  </svg>
                </div>
                <div>Joined {profileData.joinedDate}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                href={{
                  pathname: `/user/${profileData.userNickname}/following`,
                  query: {
                    id: profileData.docId,
                  },
                }}
              >
                {profileData.following?.length}{' '}
                <span className="text-[#71767b]">Following</span>
              </Link>
              <Link
                href={{
                  pathname: `/user/${profileData.userNickname}/followers`,
                  query: {
                    id: profileData.docId,
                  },
                }}
              >
                {profileData.followers?.length}{' '}
                <span className="text-[#71767b]">Followers</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-4 text-center border-b-[1px] border-[#2f3336]">
            <button
              className={
                selectedTab === 'tweets'
                  ? `flex justify-center relative py-4 cursor-pointer text-[#e7e9ea] font-bold`
                  : 'relative py-4 cursor-pointer text-[#71767b]'
              }
              onClick={() => setSelectedTab('tweets')}
            >
              Tweets
              {selectedTab === 'tweets' && (
                <div className="bg-[#1d9bf0] h-1 absolute bottom-0 w-[63px] rounded-full"></div>
              )}
            </button>
            <button
              className={
                selectedTab === 'replies'
                  ? `flex justify-center relative py-4 cursor-pointer text-[#e7e9ea] font-bold`
                  : 'py-4 cursor-pointer text-[#71767b]'
              }
              onClick={() => setSelectedTab('replies')}
            >
              Replies
              <div className="bg-[#1d9bf0] h-1 absolute bottom-0 w-[63px] rounded-full"></div>
            </button>
            <button className="py-4 cursor-not-allowed text-[#71767b]">
              Media
            </button>
            <button className="py-4 cursor-not-allowed text-[#71767b]">
              Likes
            </button>
          </div>
        </div>
      </div>

      {selectedTab === 'tweets' ? (
        <Tweetlist
          auth={auth}
          allTweets={usersTweets}
          deleteTweet={deleteTweet}
          likeTweet={likeTweet}
        />
      ) : (
        <TweetRepliesList
          auth={auth}
          repliesOnly={repliesOnly}
          deleteTweet={deleteTweet}
          likeTweet={likeTweet}
        />
      )}
    </div>
  );
}
