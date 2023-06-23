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
  const modalRef = useRef(null);
  const [LikedUsers, setLikedUsers] = useState([]);
  const [myUserDetails, setMyUserDetails] = useState([]);
  const usersCollectionRef = collection(db, 'users');

  const getAllUsersIncludingMyself = async () => {
    try {
      const data = await getDocs(usersCollectionRef);
      const filteredData: any = data.docs.map((document) => {
        if (document.data().userId === auth.currentUser.uid) {
          setMyUserDetails(document.data());
        }
        if (likedBy.includes(document.data().userId)) {
          return { ...document.data(), docUserId: document.id };
        }
      });
      setLikedUsers(filteredData.filter((user) => user !== undefined));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAllUsersIncludingMyself();
  }, []);

  console.log(myUserDetails);

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
          className="py-1.5 px-4 rounded-3xl bg-black h-fit text-white outline-1 outline"
        >
          Following
        </button>
      );
    }
    return (
      <button
        onClick={(e) => onFollowClick(e, user.docUserId)}
        className="py-1.5 px-4 rounded-3xl bg-slate-50 h-fit text-black"
      >
        Follow
      </button>
    );
  };

  return (
    <div className="flex flex-col">
      {LikedUsers.map((user: any) => (
        <Link
          key={user.userId}
          href={`/user/${user.userNickname}`}
          className="flex gap-4 select-none hover:bg-[#131212] px-4 py-3 duration-150"
        >
          <div>
            <img
              className="rounded-full w-12"
              src={user.userProfileImg}
              alt="user profile image"
            />
          </div>
          <div className="flex justify-between w-full">
            <div>
              <div className="font-bold w-fit hover:underline">
                {user.userName}
              </div>

              <div className="text-slate-400">{user.userNickname}</div>
              <div>user description</div>
            </div>
            {renderFollowButton(user)}
          </div>
        </Link>
      ))}
    </div>
  );
};
export default Userlist;
