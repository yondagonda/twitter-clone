/* eslint-disable @next/next/no-img-element */
import { FC, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import Userlist from './Userlist';
import { auth } from '../config/firebase';

export const CreateTweetModal: FC = ({ setIsCreateTweetModalOpen }: any) => {
  const modalRef = useRef(null);
  //   console.log(showImageModal);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsCreateTweetModalOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  return (
    <div
      className="fixed top-[25%] left-[50%] translate-x-[-50%] translate-y-[-50%]
  rounded-lg h-[330px] w-[600px] bg-slate-600"
      ref={modalRef}
    >
      <div className="p-2">
        <div>X</div>
        <div className="flex p-4 gap-3">
          <div>
            <img
              src={`${auth?.currentUser?.photoURL}`}
              className="h-8 rounded-full min-w-[32px]"
              alt="profile photo"
            />
          </div>
          <div>
            <div>Everyone</div>
            <input
              className="bg-transparent ring-2 py-2 px-14 outline-none"
              placeholder="What's happening?"
              // value={tweetContent}
              // onChange={(e) => setTweetContent(e.target.value)}
            ></input>
          </div>
        </div>
      </div>
      <div className="px-2 bottom-0 fixed w-full">
        <div className="border-t-[1px] flex justify-between py-2">
          <div>Image Picker</div>
          <button
            className="right-0 px-4 py-1 rounded-3xl bg-[#1d9bf0] h-auto font-bold"
            // onClick={uploadFile}
          >
            Tweet
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateTweetModal;
