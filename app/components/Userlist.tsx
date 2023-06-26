/* eslint-disable consistent-return */
/* eslint-disable @next/next/no-img-element */
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const Userlist: FC = ({ likedBy }: any) => {
  const [LikedUsers, setLikedUsers] = useState([]);
  const [myUserDetails, setMyUserDetails] = useState([]);
  const usersCollectionRef = collection(db, 'users');

  useEffect(() => {
    getAllUsersIncludingMyself();
  }, [likedBy]);

  const getAllUsersIncludingMyself = async () => {
    const data = await getDocs(usersCollectionRef);

    const promises = data.docs.map((document) => {
      if (document.data().userId === auth?.currentUser?.uid) {
        setMyUserDetails(document.data());
      }
      if (likedBy.includes(document.data().userId)) {
        return { ...document.data(), docUserId: document.id };
      }
    });
    const filteredData = await Promise.all(promises);
    setLikedUsers(filteredData.filter((user) => user !== undefined));
  };

  useEffect(() => {
    getAllUsersIncludingMyself();
  }, []);

  const addToFollowing = async (recipientUserId: any) => {
    console.log(
      `now add this userid to our current following list ${recipientUserId}`
    );
    const data = await getDocs(usersCollectionRef);
    const filteredData = data.docs.map(async (document) => {
      if (myUserDetails.userId === document.data().userId) {
        const recipientRef = doc(db, 'users', document.id);
        await updateDoc(recipientRef, {
          following: arrayUnion(recipientUserId),
        });
      }
    });
  };

  const removeFromFollowing = async (recipientUserId: any) => {
    console.log(
      `now add this userid to our current following list ${recipientUserId}`
    );
    const data = await getDocs(usersCollectionRef);
    const filteredData = data.docs.map(async (document) => {
      if (myUserDetails.userId === document.data().userId) {
        const recipientRef = doc(db, 'users', document.id);
        await updateDoc(recipientRef, {
          following: arrayRemove(recipientUserId),
        });
      }
    });
  };

  const onFollowClick = async (e, recipientDocId: any) => {
    e.preventDefault();
    const recipientRef = doc(db, 'users', recipientDocId);
    const getrecipientRef = await getDoc(recipientRef);
    const recipientFollowers = getrecipientRef?.data()?.followers;

    if (recipientFollowers.includes(myUserDetails.userId)) {
      await updateDoc(recipientRef, {
        followers: arrayRemove(myUserDetails.userId),
      });
      const recipientUserId = getrecipientRef?.data()?.userId;
      console.log(`recipient userid: ${recipientUserId}`);
      await removeFromFollowing(recipientUserId);
    } else {
      await updateDoc(recipientRef, {
        followers: arrayUnion(myUserDetails.userId),
      });
      await addToFollowing(getrecipientRef?.data()?.userId);
    }
    getAllUsersIncludingMyself();
  };

  const renderFollowButton = (user) => {
    if (user.userId === myUserDetails.userId) {
      return;
    }
    if (myUserDetails.following.includes(user.userId)) {
      return (
        <button
          onClick={(e) => onFollowClick(e, user.docUserId)}
          className="py-[7px] px-4 rounded-3xl bg-black h-fit text-[#e7e9ea] font-bold text-sm
          outline-[#536471] outline outline-[0.5px] hover:outline-[#f4212e] hover:text-[#f4212e]
          before:content-['Following'] hover:before:content-['Unfollow']"
        ></button>
      );
    }
    return (
      <button
        onClick={(e) => onFollowClick(e, user.docUserId)}
        className="py-[7px] px-4 rounded-3xl bg-[#eff3f4] h-fit text-black font-bold text-sm hover:bg-[#d1d1d1]
        duration-200"
      >
        Follow
      </button>
    );
  };
  console.log(LikedUsers);

  return (
    <div className="flex flex-col">
      {LikedUsers.map((user: any) => (
        <Link
          key={user.userId}
          href={`/user/${user.userNickname}`}
          className="flex gap-3 select-none hover:bg-[#131212] px-4 py-3 duration-150"
        >
          <div className="pt-1">
            <img
              className="rounded-full w-10"
              src={user.userProfileImg}
              alt="user profile image"
            />
          </div>
          <div className="flex justify-between w-full">
            <div>
              <div className="font-bold w-fit hover:underline text-[15px]">
                {user.userName}
              </div>

              <div className="text-[#71767b] text-[15px] leading-5">
                @{user.userNickname}
              </div>
              <div className="text-[#e7e9ea] text-[15px]">{user.bio}</div>
            </div>
            {renderFollowButton(user)}
          </div>
        </Link>
      ))}
    </div>
  );
};
export default Userlist;
