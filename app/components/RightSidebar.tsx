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
import { usePathname } from 'next/navigation';
import { HelloContext } from '../(pages)/layout.tsx';
import { db } from '../config/firebase.tsx';

export default function RightSidebar({ currentLoggedInUser }: any) {
  const usersCollectionRef = collection(db, 'users');

  const { refreshWhoToFollowTab, whoToFollowTab, getProfileData, getList } =
    useContext(HelloContext);
  const [myUserDetails, setMyUserDetails] = useState<Array>([]);

  const getMyUserDetails = async () => {
    const data = await getDocs(usersCollectionRef);
    data.docs.map((document) => {
      if (document.data().userId === currentLoggedInUser.uid) {
        setMyUserDetails({ ...document.data(), docUserId: document.id });
      }
    });
  };

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

  const pathname = usePathname();
  const param = pathname.slice(6); // grabs the nickname from the url
  const followListparam = pathname.slice(-9); // grabs the follower/following status from the url

  const onFollowClick = async (e: Object, recipientDocId: any) => {
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
      pathname === '/user/batman' // this ensures profile page button gets updated
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

  const renderFollowButton = (demoacc: any) => {
    if (myUserDetails.length > 0 || myUserDetails.length === undefined) {
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
    }
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
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
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

          <button
            onClick={() => {
              window.open(
                'https://github.com/yondagonda/twitter-clone#technologies'
              );
            }}
            className="w-full px-3 py-2.5  hover:bg-[#1d1f24] duration-100 group flex gap-2 items-center"
          >
            <svg
              className="fill-[#e7e9ea] group-hover:fill-[#1d9bf0] duration-200"
              height={27}
              width={27}
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 477.057 477.057"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <g>
                  <path d="M167.151,285.641c-47.054-3.222-84.37-42.427-84.37-90.28c0-49.959,40.64-90.599,90.598-90.599 c40.105,0,74.161,26.222,86.05,62.397c0.706-0.03,1.382-0.202,2.096-0.202c5.435,0,10.723,0.994,15.646,2.905 c4.527-10.204,12.936-18.248,23.293-22.48c-2.026-5.365-4.294-10.606-6.957-15.623l20.693-20.693 c2.664-2.663,4.162-6.282,4.162-10.055c0-3.773-1.498-7.392-4.162-10.055l-36.44-36.424c-5.551-5.552-14.558-5.552-20.111,0 l-20.692,20.693c-7.485-3.968-15.366-7.291-23.605-9.822V36.199c0-7.85-6.367-14.217-14.217-14.217h-51.512 c-7.849,0-14.216,6.367-14.216,14.217v29.203c-8.239,2.531-16.12,5.855-23.613,9.822L89.116,54.547 c-5.552-5.552-14.558-5.552-20.11,0L32.572,90.971c-2.662,2.663-4.162,6.282-4.162,10.055c0,3.774,1.5,7.392,4.162,10.055 L53.25,131.76c-3.968,7.493-7.291,15.366-9.821,23.605H14.216C6.367,155.364,0,161.731,0,169.582v51.526 c0,7.851,6.367,14.218,14.216,14.218h29.204c2.53,8.237,5.854,16.118,9.821,23.611l-20.684,20.686 c-5.553,5.551-5.553,14.558,0,20.11l36.432,36.434c5.551,5.551,14.558,5.551,20.11,0l20.677-20.678 c7.493,3.975,15.382,7.305,23.629,9.837v29.203c0,7.851,6.367,14.218,14.216,14.218h33.302 c-9.077-7.935-14.853-19.56-14.853-32.534C166.073,327.928,165.419,293.638,167.151,285.641z"></path>{' '}
                  <path d="M230.953,179.599c1.748-1.748,3.673-3.231,5.645-4.635c-8.673-26.789-33.574-46.348-63.221-46.348 c-36.804,0-66.744,29.941-66.744,66.746c0,38.606,33.45,71.412,75.441,65.868c2.966-2.415,6.219-4.489,9.761-6.057 C179.257,222.622,205.71,204.848,230.953,179.599z"></path>{' '}
                  <path d="M337.455,260.095c-30.539,0-55.386,24.847-55.386,55.386s24.847,55.386,55.386,55.386 c30.546,0,55.394-24.847,55.394-55.386S368.001,260.095,337.455,260.095z"></path>{' '}
                  <path d="M477.049,294.725c0-6.321-5.124-11.445-11.445-11.445h-23.511c-2.042-6.631-4.721-12.983-7.921-19.008l16.656-16.656 c2.151-2.152,3.354-5.063,3.354-8.099c0-3.036-1.202-5.947-3.354-8.099l-29.327-29.327c-2.237-2.228-5.163-3.346-8.099-3.346 c-2.927,0-5.855,1.118-8.091,3.346l-16.67,16.67c-6.027-3.198-12.37-5.869-19.002-7.903v-23.511 c0-6.321-5.124-11.446-11.445-11.446h-41.471c-6.321,0-11.445,5.125-11.445,11.446v23.511c-6.631,2.034-12.982,4.705-19.016,7.903 l-16.648-16.646c-2.236-2.238-5.164-3.355-8.099-3.355c-2.928,0-5.855,1.118-8.091,3.347l-29.327,29.327 c-2.152,2.152-3.355,5.063-3.355,8.099c0,3.036,1.204,5.947,3.355,8.099l16.648,16.648c-3.2,6.025-5.871,12.369-7.913,19h-23.511 c-6.321,0-11.445,5.124-11.445,11.445v41.487c0,6.321,5.124,11.445,11.445,11.445h23.503c2.042,6.631,4.713,12.983,7.913,19.008 l-16.656,16.656c-4.465,4.465-4.465,11.717,0,16.19l29.327,29.327c2.151,2.152,5.063,3.354,8.099,3.354 c3.036,0,5.947-1.202,8.099-3.354l16.64-16.64c6.041,3.199,12.393,5.878,19.032,7.913v23.519c0,6.319,5.124,11.445,11.445,11.445 h41.471c6.321,0,11.445-5.125,11.445-11.445v-23.519c6.639-2.035,12.991-4.713,19.024-7.913l16.664,16.656 c2.236,2.236,5.164,3.346,8.091,3.346c2.934,0,5.862-1.11,8.097-3.346l29.32-29.32c2.15-2.15,3.354-5.062,3.354-8.099 c0-3.036-1.204-5.947-3.354-8.097l-16.656-16.656c3.199-6.033,5.879-12.385,7.913-19.024h23.511c3.036,0,5.955-1.204,8.099-3.354 c2.15-2.144,3.354-5.063,3.354-8.099L477.049,294.725z M337.455,386.769c-39.305,0-71.288-31.982-71.288-71.288 c0-39.305,31.982-71.288,71.288-71.288c39.313,0,71.296,31.982,71.296,71.288C408.751,354.786,376.768,386.769,337.455,386.769z"></path>{' '}
                </g>
              </g>
            </svg>
            <div className="text-lg group-hover:text-[#1d9bf0] duration-200 text-[#e7e9ea]">
              Technologies
            </div>
          </button>

          <button
            onClick={() => {
              window.open('https://github.com/yondagonda/twitter-clone#readme');
            }}
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
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
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
            whoToFollowTab.map((demoacc: any) => (
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
