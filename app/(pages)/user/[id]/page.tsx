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
import React, { useEffect, useState, useContext } from 'react';
import { parse } from 'date-fns';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInHours from 'date-fns/differenceInHours';
import Link from 'next/link';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { TweetRepliesList } from '@/app/components/TweetRepliesList.tsx';
import Tweetlist from '@/app/components/Tweetlist.tsx';
import { db, auth } from '@/app/config/firebase.tsx';
import { HelloContext } from '../../layout.tsx';
import EditProfileModal from '../../../components/modals/EditProfileModal.tsx';

export default function UserPage({ params }: any) {
  const usersCollectionRef = collection(db, 'users');
  const {
    nickname,
    refreshWhoToFollowTab,
    getProfileData,
    profileData,
    setProfileData,
  }: any = useContext(HelloContext);

  const [usersTweets, setUsersTweets] = useState<Array>([]);
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
      const sortedTweets = filteredData.sort((a: any, b: any) => {
        const dateA = parse(a.date, 'dd/MM/yyyy, HH:mm:ss', new Date());
        const dateB = parse(b.date, 'dd/MM/yyyy, HH:mm:ss', new Date());
        return dateB - dateA;
      });
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
      setUsersTweets(DateSortedTweets);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTweet = async (e: any, tweet: any) => {
    e.preventDefault();

    if (tweet.image.imageId !== '') {
      const storage = getStorage();
      const deleteImageRef = ref(storage, `tweetImage/${tweet.image.imageId}`);
      deleteObject(deleteImageRef);
    }

    if (tweet.parentTweet !== null) {
      const parentTweetDocRef = doc(db, 'tweets', tweet.parentTweet);
      try {
        await updateDoc(parentTweetDocRef, {
          replies: increment(-1),
        });
      } catch (error) {
        console.log(
          'Parent tweet must have already been deleted, deleting tweet'
        );
      }
    }

    const tweetsDocRef = doc(db, 'tweets', tweet.id);
    await deleteDoc(tweetsDocRef);
    getAllUsersTweets();
  };

  const likeTweet = async (e: any, tweet: any) => {
    e.preventDefault();

    const likeRef = doc(db, 'tweets', tweet.id);
    const getLikes = await getDoc(likeRef);

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

  const onFollowClick = async (recipientDocId: String) => {
    const recipientRef = doc(db, 'users', recipientDocId);
    const getrecipientRef = await getDoc(recipientRef);
    const recipientFollowers = getrecipientRef?.data()?.followers;

    if (recipientFollowers.includes(auth?.currentUser?.uid)) {
      await updateDoc(recipientRef, {
        followers: arrayRemove(auth?.currentUser?.uid),
      });
      const recipientUserId = getrecipientRef?.data()?.userId;
      removeFromFollowing(recipientUserId);
    } else {
      await updateDoc(recipientRef, {
        followers: arrayUnion(auth?.currentUser?.uid),
      });
      addToFollowing(getrecipientRef?.data()?.userId);
    }
    getProfileData(params.id);

    if (
      recipientDocId === 'Gu7cpPmDQAxlhd3TazFl' ||
      recipientDocId === 'Kn4yGgl04xxIirpIjnkF' ||
      recipientDocId === 'yC37BTRrPSALvdcLXDFx'
    ) {
      refreshWhoToFollowTab();
    }
  };

  const addToFollowing = async (recipientUserId: String) => {
    const data = await getDocs(usersCollectionRef);
    const filteredData = data.docs.map(async (document) => {
      if (auth?.currentUser?.uid === document.data().userId) {
        const recipientRef = doc(db, 'users', document.id);
        await updateDoc(recipientRef, {
          following: arrayUnion(recipientUserId),
        });
      }
    });
    filteredData.filter((user) => user !== undefined);
  };

  const removeFromFollowing = async (recipientUserId: String) => {
    const data = await getDocs(usersCollectionRef);
    const filteredData = data.docs.map(async (document) => {
      if (auth?.currentUser?.uid === document.data().userId) {
        const recipientRef = doc(db, 'users', document.id);
        await updateDoc(recipientRef, {
          following: arrayRemove(recipientUserId),
        });
      }
    });
    filteredData.filter((user) => user !== undefined);
  };

  const renderFollowButton = () => {
    if (Object.keys(profileData).length > 0) {
      if (params.id === nickname.current) {
        return (
          <button
            className="py-[7px] px-5 rounded-3xl bg-black h-fit mt-4 text-[#e7e9ea]
         outline outline-[0.5px] outline-[#536471] font-bold text-sm hover:bg-[#1f1f1f] duration-200"
            onClick={() => setIsEditProfileModalOpen(true)}
          >
            Edit Profile
          </button>
        );
      }
      if (profileData.followers?.includes(auth?.currentUser?.uid)) {
        return (
          <button
            onClick={(e) => onFollowClick(profileData.docId)}
            className="py-[7px] px-6 rounded-3xl bg-black h-fit mt-4 text-[#e7e9ea] font-bold text-sm
            outline outline-[0.5px] outline-[#536471] hover:outline-[#f4212e] hover:text-[#f4212e]
            before:content-['Following'] hover:before:content-['Unfollow']"
            data-profile-nickname={params.id}
          ></button>
        );
      }
      return (
        <button
          onClick={(e) => onFollowClick(profileData.docId)}
          className="py-[7px] px-6 rounded-3xl bg-[#eff3f4] h-fit mt-4 font-bold text-sm text-black hover:bg-[#d1d1d1] 
          duration-200"
          data-profile-nickname={params.id}
        >
          Follow
        </button>
      );
    }
  };

  const [selectedTab, setSelectedTab] = useState<String>('tweets');

  const repliesOnly = usersTweets.filter(
    (tweet: Object) => tweet.isAReply === true
  );

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] =
    useState<Boolean>(false);

  useEffect(() => {
    getProfileData(params.id);
    getAllUsersTweets();

    return () => {
      setProfileData({});
    };
  }, []);

  return (
    <div
      className="min-h-screen border-x border-[#2f3336] border-w-[1px] min-w-[270px] w-full max-w-[600px]
     text-[#e7e9ea]"
    >
      <div className="h-14 flex gap-6 p-3 items-center">
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
        <div>
          <h3 className="text-xl font-bold ">{profileData.userName}</h3>
          <h5 className="text-[#71767b] text-[13.2px] leading-3">
            {usersTweets.length} Tweets
          </h5>
        </div>
      </div>

      <section className="">
        {profileData.profileBackgroundImage ? (
          <img
            src={profileData.profileBackgroundImage}
            className="h-48 w-full object-cover"
            alt="profile background image"
          />
        ) : (
          <figure className="h-48 bg-[#333639]"></figure>
        )}

        <div className="">
          <div className="flex justify-between px-4">
            <div>
              {profileData.userProfileImg && (
                <img
                  className="rounded-full outline outline-[3.5px] outline-black
                absolute top-[179px] h-[128px] max-w-[128px] object-cover"
                  src={profileData.userProfileImg}
                  alt="profile photo"
                />
              )}
            </div>
            {renderFollowButton()}

            {isEditProfileModalOpen && (
              <div className="bg-blue-300/20 fixed top-0 left-0 right-0 bottom-0 z-[10]">
                <EditProfileModal
                  setIsEditProfileModalOpen={setIsEditProfileModalOpen}
                  profileData={profileData}
                  getProfileData={getProfileData}
                />
              </div>
            )}
          </div>
          <div className="px-4 pb-4 pt-8">
            <h2 className="font-bold text-2xl">{profileData.userName}</h2>
            <h4 className="text-[#71767b] text-[15px]">
              @{profileData.userNickname}
            </h4>

            {profileData.bio && (
              <p className="pt-3 pb-0.5 text-[15px]">{profileData.bio}</p>
            )}

            <div className="flex gap-3 pb-1.5 items-center sm:pt-2.5">
              {profileData.location && (
                <div className="flex gap-1 items-center">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    height={18}
                    width={18}
                    className="fill-[#71767b]"
                  >
                    <g>
                      <path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z"></path>
                    </g>
                  </svg>
                  <div className="text-[#71767b] text-[15px]">
                    {profileData.location}
                  </div>
                </div>
              )}

              {profileData.website && (
                <div className="flex gap-1 items-center">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    height={18}
                    width={18}
                    className="fill-[#71767b]"
                  >
                    <g>
                      <path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path>
                    </g>
                  </svg>
                  <button
                    onClick={() => {
                      window.open(`http://${profileData.website}`);
                    }}
                    className="text-[#1d9bf0] text-[15px] hover:underline cursor-pointer"
                  >
                    {profileData.website}
                  </button>
                </div>
              )}

              <div className="text-[#71767b] flex items-center gap-1">
                <div>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    width={18}
                    height={18}
                    className="fill-[#71767b] "
                  >
                    <g>
                      <path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path>
                    </g>
                  </svg>
                </div>
                <div className="text-[15px]">
                  Joined {profileData.joinedDate}
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <Link
                href={{
                  pathname: `/user/${profileData.userNickname}/following`,
                  query: {
                    id: profileData.docId,
                  },
                }}
                className="hover:underline"
              >
                <span className="text-[15px]">
                  {profileData.following?.length}{' '}
                </span>
                <span className="text-[#71767b] text-[15px]">Following</span>
              </Link>
              <Link
                href={{
                  pathname: `/user/${profileData.userNickname}/followers`,
                  query: {
                    id: profileData.docId,
                  },
                }}
                className="hover:underline"
              >
                <span className="text-[15px]">
                  {profileData.followers?.length}{' '}
                </span>
                <span className="text-[#71767b] text-[15px]">Followers</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-4 text-center border-b-[1px] border-[#2f3336]">
            <button
              className={
                selectedTab === 'tweets'
                  ? `flex justify-center relative py-4 cursor-pointer text-[#e7e9ea] font-bold hover:bg-[#181818] duration-100`
                  : 'relative py-4 cursor-pointer text-[#71767b] hover:bg-[#181818] duration-100'
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
                  ? `flex justify-center relative py-4 cursor-pointer text-[#e7e9ea] font-bold hover:bg-[#181818] duration-100`
                  : 'py-4 cursor-pointer text-[#71767b] hover:bg-[#181818] duration-100'
              }
              onClick={() => setSelectedTab('replies')}
            >
              Replies
              {selectedTab === 'replies' && (
                <div className="bg-[#1d9bf0] h-1 absolute bottom-0 w-[63px] rounded-full"></div>
              )}
            </button>
            <button className="py-4 cursor-not-allowed text-[#71767b]">
              Media
            </button>
            <button className="py-4 cursor-not-allowed text-[#71767b]">
              Likes
            </button>
          </div>
        </div>
      </section>

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
