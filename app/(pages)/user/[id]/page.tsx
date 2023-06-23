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
} from 'firebase/firestore';
import { db, auth } from '@/app/config/firebase.tsx';
import { useEffect, useState, useContext } from 'react';
import Tweetlist from '@/app/components/Tweetlist';
import RenderFollowButton from '@/app/components/FollowButton.tsx';
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
      console.log(sortedTweets);
      setUsersTweets(sortedTweets);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTweet = async (e: any, tweet: any) => {
    e.preventDefault();

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

  console.log(auth?.currentUser?.uid);
  const renderFollowButton = () => {
    if (params.id === nickname.current) {
      return (
        <button
          className="py-2 px-6 rounded-3xl bg-black h-fit mt-6 text-slate-50
       outline outline-[0.5px]"
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
          className="py-2 px-6 rounded-3xl bg-black h-fit mt-6 text-white"
          data-profile-nickname={params.id}
        >
          Unfollow
        </button>
      );
    }
    return (
      <button
        onClick={(e) => onFollowClick(profileData.docId)}
        className="py-2 px-6 rounded-3xl bg-slate-50 h-fit mt-6 text-black"
        data-profile-nickname={params.id}
      >
        Follow
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-600 dark:bg-zinc-800 w-full max-w-[47%] text-white">
      <div className="h-16 bg-gray-800 flex gap-6 p-3 items-center">
        <div className="cursor-pointer" onClick={() => window.history.back()}>
          Back
        </div>
        <div className="text-xl font-bold">{profileData.userName}</div>
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
            <div className="text-sm">@{profileData.userNickname}</div>
            <div className="py-4">This is the profile page description</div>
            <div className="flex gap-4">
              {/* {profileData.location && (
                <div className="text-slate-300">Location </div>
              )} */}
              <div className="text-slate-300">
                Joined {profileData.joinedDate}
              </div>
            </div>
            <div className="flex gap-4">
              <div>{profileData.following?.length} Following</div>
              <div>{profileData.followers?.length} Followers</div>
            </div>
          </div>
          <div className="grid grid-cols-4 text-center border-b-[1px]">
            <div className="py-4 cursor-pointer">Tweets</div>
            <div className="py-4 cursor-pointer">Replies</div>
            <div className="py-4 cursor-pointer">Media</div>
            <div className="py-4 cursor-pointer">Likes</div>
          </div>
        </div>
      </div>

      <Tweetlist
        auth={auth}
        allTweets={usersTweets}
        deleteTweet={deleteTweet}
        likeTweet={likeTweet}
      />
    </div>
  );
}
