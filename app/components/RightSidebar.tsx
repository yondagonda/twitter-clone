/* eslint-disable consistent-return */
/* eslint-disable @next/next/no-img-element */
import { useContext, useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Userlist from './Userlist';
import { HelloContext } from '../(pages)/layout';
import { db, auth } from '../config/firebase';

export default function RightSidebar({ currentLoggedInUser }) {
  const usersCollectionRef = collection(db, 'users');

  const { refreshWhoToFollowTab, whoToFollowTab, getProfileData, getList } =
    useContext(HelloContext);
  const [myUserDetails, setMyUserDetails] = useState([]);

  const getMyUserDetails = async () => {
    console.log('READING API');
    const data = await getDocs(usersCollectionRef);
    data.docs.map((document) => {
      if (document.data().userId === currentLoggedInUser.uid) {
        setMyUserDetails({ ...document.data(), docUserId: document.id });
      }
    });
  };

  const pathname = usePathname();
  const param = pathname.slice(6); // grabs the nickname from the url

  const followListparam = pathname.slice(-9); // grabs the follower/following status from the url

  useEffect(() => {
    refreshWhoToFollowTab();
  }, []);

  useEffect(() => {
    if (currentLoggedInUser !== undefined) {
      getMyUserDetails();
    }
  }, [whoToFollowTab]);

  useEffect(() => {
    if (currentLoggedInUser !== undefined) {
      getMyUserDetails();
    }
  }, [currentLoggedInUser]);

  const addToFollowing = async (recipientUserId: any) => {
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
      await removeFromFollowing(recipientUserId);
    } else {
      await updateDoc(recipientRef, {
        followers: arrayUnion(myUserDetails.userId),
      });
      await addToFollowing(getrecipientRef?.data()?.userId);
    }

    if (
      pathname === '/user/walterwhite' ||
      pathname === '/user/avataraang' ||
      pathname === '/user/batman' // this ensure profile page button gets updated
    ) {
      getProfileData(param);
    }

    if (followListparam === 'following') {
      getList('following'); // these two if statements ensure follow list gets updated
    }
    if (followListparam === 'followers') {
      getList('followers');
    }
    refreshWhoToFollowTab();
  };

  const renderFollowButton = (demoacc) => {
    if (demoacc.userId === myUserDetails.userId) {
      return;
    }
    if (myUserDetails.following.includes(demoacc.userId)) {
      return (
        <button
          onClick={(e) => onFollowClick(e, demoacc.docUserId)}
          className="py-[7px] px-[15px] rounded-3xl bg-black h-fit text-[#e7e9ea] font-bold text-sm
          outline-[#536471] outline outline-[0.5px] hover:outline-[#f4212e] hover:text-[#f4212e]
          before:content-['Following'] hover:before:content-['Unfollow']"
        ></button>
      );
    }
    return (
      <button
        onClick={(e) => onFollowClick(e, demoacc.docUserId)}
        className="py-[7px] px-[15px] rounded-3xl bg-[#eff3f4] h-fit text-black font-bold text-sm hover:bg-[#d1d1d1]
        duration-200"
      >
        Follow
      </button>
    );
  };

  return (
    <div className=" h-full py-4 text-[#e7e9ea] hidden lg:block">
      <div
        className="pl-3 xl:ml-4 flex flex-col gap-4 fixed
      w-full max-w-[28%] xl:max-w-[368px] xl:w-full removefixed"
      >
        <div className="relative">
          <input
            id="test"
            className="bg-[#202327] rounded-3xl py-3 px-4 outline-none w-full pl-[44px]
            focus:outline-[#1d9bf0] focus:bg-black outline-1 peer"
            placeholder="Search Twitter"
            type="text"
          ></input>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            height={22}
            width={21}
            className="fill-[#71767b] absolute left-[12px] top-[13px] peer-focus:fill-[#1d9bf0]"
          >
            <g>
              <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
            </g>
          </svg>
        </div>

        <div className="p-3 bg-[#16181c] rounded-2xl text-[#e7e9ea] flex flex-col gap-2">
          <div className="text-xl font-bold">Get Verified</div>
          <div className="font-bold ">Subscribe to unlock new features.</div>
          <button className="bg-[#1d9bf0] px-4 py-1.5 rounded-3xl text-[15px] font-bold text-white w-fit">
            Get Verified
          </button>
        </div>

        <div className=" bg-[#16181c] rounded-2xl text-[#e7e9ea]">
          <div className="text-xl font-bold px-3 pt-3 pb-2">Links</div>
          <button
            onClick={() => {
              window.open('https://github.com/yondagonda');
            }}
            className="w-full px-3 py-2.5 hover:bg-[#1d1f24] duration-100 flex group gap-2 items-center"
          >
            <svg
              viewBox="0 0 48 48"
              id="Layer_2"
              data-name="Layer 2"
              xmlns="http://www.w3.org/2000/svg"
              height={27}
              width={27}
              className="fill-[#e7e9ea] group-hover:fill-[#1d9bf0] duration-200"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <defs></defs>
                <path
                  className="cls-1"
                  d="M24,2.5a21.5,21.5,0,0,0-6.8,41.9c1.08.2,1.47-.46,1.47-1s0-1.86,0-3.65c-6,1.3-7.24-2.88-7.24-2.88A5.7,5.7,0,0,0,9,33.68c-1.95-1.33.15-1.31.15-1.31a4.52,4.52,0,0,1,3.29,2.22c1.92,3.29,5,2.34,6.26,1.79a4.61,4.61,0,0,1,1.37-2.88c-4.78-.54-9.8-2.38-9.8-10.62a8.29,8.29,0,0,1,2.22-5.77,7.68,7.68,0,0,1,.21-5.69s1.8-.58,5.91,2.2a20.46,20.46,0,0,1,10.76,0c4.11-2.78,5.91-2.2,5.91-2.2a7.74,7.74,0,0,1,.21,5.69,8.28,8.28,0,0,1,2.21,5.77c0,8.26-5,10.07-9.81,10.61a5.12,5.12,0,0,1,1.46,4c0,2.87,0,5.19,0,5.9s.39,1.24,1.48,1A21.5,21.5,0,0,0,24,2.5"
                ></path>
              </g>
            </svg>
            <div className="text-lg group-hover:text-[#1d9bf0] duration-200 text-[#e7e9ea]">
              Github
            </div>
          </button>

          <button
            onClick={() => {
              window.open(
                'https://github.com/yondagonda/twitter-clone/commits/main'
              );
            }}
            className="w-full px-3 py-2.5  hover:bg-[#1d1f24] duration-100 group flex gap-2 items-center"
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-[#e7e9ea] group-hover:fill-[#1d9bf0] duration-200"
              height={27}
              width={27}
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <title>git</title>
                <rect width="24" height="24" fill="none"></rect>
                <path d="M2.6,10.59,8.38,4.8l1.69,1.7A2,2,0,0,0,11,8.73v5.54A2,2,0,0,0,10,16a2,2,0,0,0,4,0,2,2,0,0,0-1-1.73V9.41l2.07,2.09A1.17,1.17,0,0,0,15,12a2,2,0,1,0,2-2,1.17,1.17,0,0,0-.5.07L13.93,7.5a2,2,0,0,0-1.15-2.34,2.1,2.1,0,0,0-1.28-.09L9.8,3.38l.79-.78a2,2,0,0,1,2.82,0l8,8a2,2,0,0,1,0,2.82l-8,8a2,2,0,0,1-2.82,0l-8-8A2,2,0,0,1,2.6,10.59Z"></path>{' '}
              </g>
            </svg>
            <div className="text-lg group-hover:text-[#1d9bf0] duration-200 text-[#e7e9ea]">
              Commit Log
            </div>
          </button>

          <button className="w-full px-3 py-2.5  hover:bg-[#1d1f24] duration-100 group flex gap-2 items-center">
            <svg
              viewBox="0 0 1024 1024"
              className="fill-[#e7e9ea] group-hover:fill-[#1d9bf0] duration-200"
              height={27}
              width={27}
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M873.363 924.731c-0.039 40.905-33.184 74.053-74.083 74.099h-574.519c-40.91-0.039-74.065-33.19-74.111-74.096 0-3.965 0.734-7.904 2.144-11.609l198.996-521.504c0.069-0.827 0.187-1.654 0.291-2.47v-298.833h-23.511c-18.001 0-32.564-14.587-32.564-32.576s14.563-32.576 32.564-32.576h56.076c0.003 0 0.007 0 0.012 0 17.99 0 32.576 14.586 32.576 32.576 0 0 0 0 0 0v333.925c0 1.876-0.163 3.728-0.478 5.581 0 3.973-0.956 9.321-2.388 13.014l-119.863 314.118h432.199l-123.837-313.769c-1.401-3.431-2.233-7.411-2.275-11.581l-0.241-0.957c-0.133-1.155-0.209-2.493-0.209-3.847v-336.484c0-0.003 0-0.007 0-0.012 0-17.985 14.579-32.564 32.564-32.564 0 0 0 0 0 0h57.543c18.001 0 32.564 14.587 32.564 32.576s-14.563 32.576-32.564 32.576h-24.991v300.976l205.824 521.469c1.503 3.822 2.284 7.865 2.284 11.965zM448.899 651.798c0.42-13.171 11.197-23.689 24.432-23.689s24.013 10.517 24.43 23.651c0.001 13.495-10.962 24.47-24.443 24.47s-24.42-10.975-24.42-24.432zM465.164 651.798c-0.003 0.086-0.005 0.188-0.005 0.29 0 4.505 3.651 8.156 8.156 8.156 4.505 0 8.156-3.651 8.156-8.156 0-0.115-0.002-0.228-0.006-0.341-0.178-4.347-3.759-7.814-8.148-7.814-4.402 0-7.989 3.487-8.15 7.851zM575.101 627.366c0-0.003 0-0.007 0-0.012 0-13.5 10.943-24.444 24.444-24.444 13.5 0 24.444 10.943 24.444 24.444 0 13.5-10.943 24.444-24.444 24.444-13.49-0.014-24.423-10.942-24.444-24.43zM591.389 627.366c-0.003 0.086-0.005 0.188-0.005 0.29 0 4.505 3.651 8.156 8.156 8.156 4.505 0 8.156-3.651 8.156-8.156 0-0.115-0.002-0.228-0.006-0.341-0.178-4.347-3.759-7.814-8.148-7.814-4.402 0-7.989 3.487-8.15 7.851zM507.223 545.939c0.027-18.737 15.212-33.919 33.949-33.939 18.733 0.027 33.909 15.207 33.93 33.936-0.027 18.732-15.2 33.908-33.924 33.941-18.743-0.014-33.934-15.199-33.953-33.936zM523.51 545.939c0 9.728 7.922 17.651 17.663 17.651 9.716 0 17.663-7.922 17.663-17.651 0-9.741-7.947-17.663-17.663-17.663-9.741 0-17.663 7.922-17.663 17.663z"></path>
              </g>
            </svg>
            <div className="text-lg group-hover:text-[#1d9bf0] duration-200 text-[#e7e9ea]">
              Technologies
            </div>
          </button>

          <button
            className="w-full px-3 pt-2.5 pb-3  hover:bg-[#1d1f24] duration-100 group flex gap-3 items-center
          rounded-b-2xl"
          >
            <svg
              version="1.1"
              className="fill-[#e7e9ea] group-hover:fill-[#1d9bf0] duration-200"
              height={27}
              width={27}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M16,27c0,0,3-1,6-1s7,1,7,1V8c0,0,0-1-0.983-1.224C26.647,6.463,24.081,6,22,6c-3,0-6,1-6,1 s-3-1-6-1C7.919,6,5.353,6.463,3.983,6.776C3,7,3,8,3,8v19c0,0,4-1,7-1S16,27,16,27z M20,13h5c0.552,0,1,0.447,1,1s-0.448,1-1,1h-5 c-0.552,0-1-0.447-1-1S19.448,13,20,13z M20,17h5c0.552,0,1,0.447,1,1s-0.448,1-1,1h-5c-0.552,0-1-0.447-1-1S19.448,17,20,17z M7,13 h5c0.552,0,1,0.447,1,1s-0.448,1-1,1H7c-0.552,0-1-0.447-1-1S6.448,13,7,13z M6,18c0-0.553,0.448-1,1-1h5c0.552,0,1,0.447,1,1 s-0.448,1-1,1H7C6.448,19,6,18.553,6,18z M31,8.999v20c0,0.279-0.117,0.547-0.323,0.736c-0.186,0.17-0.427,0.264-0.677,0.264 c-0.028,0-11.004-0.913-11.004-0.913c-0.043,0.512-0.473,0.913-0.996,0.913h-4c-0.523,0-0.953-0.401-0.996-0.913L2.083,29.996 c-0.281,0.029-0.554-0.071-0.76-0.26C1.117,29.546,1,29.279,1,28.999v-20c0-0.553,0.448-1,1-1v0v19.648 c0,0.321,0.295,0.56,0.608,0.488C4.056,27.801,7.755,27,10,27c2.794,0,5.656,0.939,5.684,0.949l0.315,0.105l0.316-0.105 C16.344,27.939,19.206,27,22,27c2.245,0,5.944,0.801,7.392,1.136C29.705,28.208,30,27.969,30,27.648L30,8v0 C30.552,7.999,31,8.447,31,8.999z"></path>{' '}
              </g>
            </svg>
            <div className="text-lg group-hover:text-[#1d9bf0] duration-200 text-[#e7e9ea]">
              Read Me
            </div>
          </button>
        </div>
        <div className="bg-[#16181c] rounded-2xl text-[#e7e9ea]">
          <div className="px-3 pt-3 pb-2 text-xl font-bold">Who to follow</div>

          {whoToFollowTab.length > 0 &&
            whoToFollowTab.map((demoacc) => (
              <Link
                key={demoacc.userId}
                href={`/user/${demoacc.userNickname}`}
                className="flex gap-3 select-none hover:bg-[#1d1f24] px-4 py-3 duration-150"
              >
                <div className="">
                  <img
                    className="rounded-full min-w-[40px] max-w-[40px] hover:brightness-[.85] 
                  h-[40px] duration-200 object-cover"
                    src={demoacc.userProfileImg}
                    alt="user profile image"
                  />
                </div>
                <div className="flex justify-between gap-3 items-center w-full max-w-[80%]">
                  <div className="truncate">
                    <div className="font-bold hover:underline text-[15px] truncate">
                      {demoacc.userName}
                    </div>

                    <div className="text-[#71767b] text-[15px] leading-5">
                      @{demoacc.userNickname}
                    </div>
                  </div>
                  {renderFollowButton(demoacc)}
                </div>
              </Link>
            ))}
          <div
            className="w-full px-3 py-3 rounded-b-2xl hover:bg-[#1d1f24] duration-100 text-[#1d9bf0]
          select-none"
          >
            Show more
          </div>
        </div>
      </div>
    </div>
  );
}
