/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable @next/next/no-img-element */
import { FC, useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import {
  collection,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDoc,
  doc,
} from 'firebase/firestore';
import React from 'react';
import { db, auth } from '../config/firebase';
import { HelloContext } from '../(pages)/layout';

export const Userlist: FC = ({ likedBy }: any) => {
  const [LikedUsers, setLikedUsers] = useState<Array>([]);
  const [myUserDetails, setMyUserDetails] = useState<Array>([]);
  const usersCollectionRef = collection(db, 'users');

  useEffect(() => {
    if (likedBy.length > 0) {
      getAllUsersIncludingMyself();
    }
  }, [likedBy]);

  const { refreshWhoToFollowTab } = useContext(HelloContext);

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

  const addToFollowing = async (recipientUserId: any) => {
    const data = await getDocs(usersCollectionRef);
    data.docs.map(async (document) => {
      if (myUserDetails.userId === document.data().userId) {
        const recipientRef = doc(db, 'users', document.id);
        await updateDoc(recipientRef, {
          following: arrayUnion(recipientUserId),
        });
      }
    });
  };

  const removeFromFollowing = async (recipientUserId: any) => {
    const data = await getDocs(usersCollectionRef);
    data.docs.map(async (document) => {
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
      await removeFromFollowing(recipientUserId);
    } else {
      await updateDoc(recipientRef, {
        followers: arrayUnion(myUserDetails.userId),
      });
      await addToFollowing(getrecipientRef?.data()?.userId);
    }

    if (
      recipientDocId === 'Gu7cpPmDQAxlhd3TazFl' ||
      recipientDocId === 'Kn4yGgl04xxIirpIjnkF' ||
      recipientDocId === 'yC37BTRrPSALvdcLXDFx'
    ) {
      await refreshWhoToFollowTab();
    }
    await getAllUsersIncludingMyself();
  };

  const renderFollowButton = (user: Object<any>) => {
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

  return (
    <section className="flex flex-col">
      {LikedUsers.map((user: any) => (
        <Link
          key={user.userId}
          href={`/user/${user.userNickname}`}
          className="flex gap-3 select-none hover:bg-[#131212] px-4 py-3 duration-150"
        >
          <figure className="pt-1">
            <img
              className="rounded-full min-w-[40px] max-w-[40px] hover:brightness-[.85] 
              h-[40px] duration-200 object-cover"
              src={user.userProfileImg}
              alt="user profile image"
            />
          </figure>
          <div className="flex justify-between w-full">
            <div>
              <h4 className="font-bold w-fit hover:underline text-[15px]">
                {user.userName}
              </h4>

              <h5 className="text-[#71767b] text-[15px] leading-5">
                @{user.userNickname}
              </h5>
              <div className="text-[#e7e9ea] text-[15px]">{user.bio}</div>
            </div>
            {renderFollowButton(user)}
          </div>
        </Link>
      ))}
    </section>
  );
};
export default Userlist;
