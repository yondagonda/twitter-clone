'use client';

import { useSearchParams } from 'next/navigation';
import Userlist from '@/app/components/Userlist.tsx';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/app/config/firebase.tsx';
import { useEffect, useState } from 'react';

export default function FollowPage({ params }: any) {
  const searchParams = useSearchParams();
  const profileDocId = searchParams.get('id');
  const userRef = doc(db, 'users', profileDocId);

  const [userList, setUserList] = useState([]);
  const [currentTab, setCurrentTab] = useState(params.follow);
  const [profileDetails, setProfileDetails] = useState<any>({});

  const getList = async (followersOrFollowing) => {
    const list = await getDoc(userRef);
    setProfileDetails(list.data());
    if (followersOrFollowing === 'followers') {
      setUserList(list?.data()?.followers);
    } else {
      setUserList(list?.data()?.following);
    }
  };

  useEffect(() => {
    if (params.follow === 'following') {
      getList('following');
    }
    if (params.follow === 'followers') {
      getList('followers');
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-black border-x border-[#2f3336] border-w-[1px] w-full
      max-w-[47%] text-white"
    >
      <div>
        <div className="flex p-3 gap-7">
          <button
            className="cursor-pointer"
            onClick={() => window.history.back()}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              height={22}
              width={22}
              style={{ fill: 'white' }}
            >
              <g>
                <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
              </g>
            </svg>
          </button>
          <div className="flex flex-col">
            <div className="text-xl font-bold">{profileDetails.userName}</div>
            <div className="text-[#71767b] text-sm">
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
                currentTab === 'followers' && 'font-bold text-white relative'
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
                currentTab === 'following' && 'font-bold text-white relative'
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
