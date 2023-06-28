'use client';

import { useSearchParams } from 'next/navigation';
import Userlist from '@/app/components/Userlist.tsx';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/app/config/firebase.tsx';
import { useEffect, useState, useContext } from 'react';
import { HelloContext } from '@/app/(pages)/layout';

export default function FollowPage({ params }: any) {
  const [currentTab, setCurrentTab] = useState(params.follow);

  const { getList, profileDetails, userList, setUserList, setProfileDetails } =
    useContext(HelloContext);

  useEffect(() => {
    setProfileDetails(''); //
    setUserList(''); // doing these state resets help minmise/stop the prev state to new state rendering lag
    if (params.follow === 'following') {
      getList('following');
    }
    if (params.follow === 'followers') {
      getList('followers');
    }
  }, []);

  return (
    <div
      className="min-h-screen border-x border-[#2f3336] border-w-[1px] min-w-[270px] w-full max-w-[600px]
     text-[#e7e9ea]"
    >
      <div>
        <div className="flex p-3 gap-6 h-14 items-center">
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
          <div className="flex flex-col">
            <div className="text-xl font-bold">{profileDetails.userName}</div>
            <div className="text-[#71767b] text-[13.2px] leading-3">
              @{profileDetails.userNickname}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 w-full justify-between text-center border-b-[1px] border-[#2f3336]">
          <button
            className=" hover:bg-[#1f1d1d] duration-100"
            onClick={() => {
              setCurrentTab('followers');
              getList('followers');
            }}
          >
            <div
              className={`text-[#71767b] flex flex-col items-center justify-center ${
                currentTab === 'followers' &&
                'font-bold text-[#e7e9ea] relative'
              }`}
            >
              <div className="py-4">Followers</div>
              {currentTab === 'followers' && (
                <div className="bg-[#1d9bf0] h-1 absolute bottom-0 w-[78px] rounded-full"></div>
              )}
            </div>
          </button>

          <button
            className=" hover:bg-[#1f1d1d] duration-100"
            onClick={() => {
              setCurrentTab('following');
              getList('following');
            }}
          >
            <div
              className={`text-[#71767b] flex flex-col items-center justify-center ${
                currentTab === 'following' &&
                'font-bold text-[#e7e9ea] relative'
              }`}
            >
              <div className="py-4">Following</div>
              {currentTab === 'following' && (
                <div className="bg-[#1d9bf0] h-1 absolute bottom-0 w-[78px] rounded-full"></div>
              )}
            </div>
          </button>
        </div>

        {userList.length > 0 && <Userlist likedBy={userList} />}
      </div>
    </div>
  );
}
