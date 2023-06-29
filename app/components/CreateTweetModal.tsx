/* eslint-disable @next/next/no-img-element */
import { FC, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { useContext } from 'react';
import Userlist from './Userlist';
import { auth } from '../config/firebase';
import { HelloContext } from '../(pages)/layout';
import useAutosizeTextArea from './useAutoSizeTextArea';

export const CreateTweetModal: FC = ({ setIsCreateTweetModalOpen }: any) => {
  const {
    tweetContent,
    setTweetContent,
    handleImageChange,
    uploadFile,
    imagePreview,
    renderPreview,
    setImageUpload,
    setImagePreview,
    clearInputs,
  }: any = useContext(HelloContext);

  const modalRef = useRef(null);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsCreateTweetModalOpen(false);
      clearInputs();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  const modalTextAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(modalTextAreaRef.current, tweetContent);

  return (
    <div
      className="fixed top-[30%] left-[50%] translate-x-[-50%] translate-y-[-50%]
  rounded-2xl min-h-[300px] w-[90%] md:w-[600px] bg-black flex flex-col justify-between"
      ref={modalRef}
    >
      <div className="px-4 py-4 relative">
        <button
          className="w-fit p-1.5 rounded-full hover:bg-[#141414] duration-150"
          onClick={() => {
            clearInputs();
            setIsCreateTweetModalOpen(false);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            height={22}
            width={22}
            className="fill-[#eff3f4]"
          >
            <g>
              <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
            </g>
          </svg>
        </button>
        <div className="flex pb-4 pt-2.5 pr-4 gap-3 w-full">
          <div className="pt-1">
            <img
              src={`${auth?.currentUser?.photoURL}`}
              className="h-10 rounded-full min-w-[40px] max-w-[40px] object-cover"
              alt="profile photo"
            />
          </div>
          <div className="w-full">
            <div
              className="gap-1 w-fit outline-[#536471] outline outline-1 px-4 py-0.5 
            rounded-3xl items-center flex text-sm mb-4 font-bold"
            >
              <div className="text-[#1d9bf0]">Everyone</div>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                height={16}
                width={16}
                className="fill-[#1d9bf0]"
              >
                <g>
                  <path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"></path>
                </g>
              </svg>
            </div>
            <textarea
              ref={modalTextAreaRef}
              maxLength={140}
              className="bg-transparent mt-2 outline-none text-xl 
              w-full resize-none placeholder:text-[#71767b]"
              placeholder="What's happening?!"
              value={tweetContent}
              rows={1}
              onChange={(e) => setTweetContent(e.target.value)}
            ></textarea>
          </div>
        </div>
        {imagePreview && renderPreview()}
      </div>

      <div className="px-2 w-full">
        <div className="text-[#1d9bf0] ml-3 pb-2  text-sm font-bold flex gap-1 items-center">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            height={16}
            width={16}
            className="fill-[#1d9bf0]"
          >
            <g>
              <path d="M12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-.25 10.48L10.5 17.5l-2-1.5v-3.5L7.5 9 5.03 7.59c1.42-2.24 3.89-3.75 6.72-3.84L11 6l-2 .5L8.5 9l5 1.5-1.75 1.73zM17 14v-3l-1.5-3 2.88-1.23c1.17 1.42 1.87 3.24 1.87 5.23 0 1.3-.3 2.52-.83 3.61L17 14z"></path>
            </g>
          </svg>
          Everyone can reply
        </div>

        <div className="border-t-[1px] border-[#2f3336] flex justify-between pb-2 pt-2.5 items-center">
          <div className="pl-2">
            <label htmlFor="pickimage" className="cursor-pointer ">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                width={22}
                height={22}
                className="fill-[#1d9bf0]"
              >
                <g>
                  <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path>
                </g>
              </svg>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                id="pickimage"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <button
            className={`right-0 px-[17px] py-[7px] rounded-3xl bg-[#1d9bf0]  font-bold text-sm
            ${tweetContent === '' && 'pointer-events-none brightness-50'}`}
            onClick={() => {
              uploadFile();
              setIsCreateTweetModalOpen(false);
            }}
          >
            Tweet
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateTweetModal;
