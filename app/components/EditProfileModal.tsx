/* eslint-disable @next/next/no-img-element */
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Userlist from './Userlist';
import { db } from '../config/firebase';

export const EditProfileModal: FC = ({
  setIsEditProfileModalOpen,
  profileData,
  getProfileData,
}: any) => {
  const modalRef = useRef(null);
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsEditProfileModalOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  const userRef = doc(db, 'users', profileData.docId);

  const [bioContent, setBioContent] = useState('');
  const [locationName, setLocationName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  useEffect(() => {
    setBioContent(profileData.bio);
    setLocationName(profileData.location);
    setWebsiteUrl(profileData.website);
  }, []);

  const onSave = async () => {
    setIsEditProfileModalOpen(false);

    await updateDoc(userRef, {
      bio: bioContent,
    });
    await updateDoc(userRef, {
      location: locationName,
    });
    await updateDoc(userRef, {
      website: websiteUrl,
    });
    getProfileData();
  };

  return (
    <div
      className="fixed w-[550px] h-[430px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
  bg-black rounded-xl"
      ref={modalRef}
    >
      <div className="flex items-center p-5 justify-between">
        <div className="flex gap-6">
          <button onClick={() => setIsEditProfileModalOpen(false)}>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              width={20}
              height={20}
              className="fill-[#eff3f4]"
            >
              <g>
                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
              </g>
            </svg>
          </button>
          <div className="text-xl font-bold">Edit Profile</div>
        </div>
        <button
          className="py-[7px] px-6 rounded-3xl bg-[#eff3f4] h-fit font-bold text-sm text-black hover:bg-[#dfdfdf] 
        duration-200"
          onClick={onSave}
        >
          Save
        </button>
      </div>
      <div className="flex flex-col gap-7 px-5 mt-4">
        <div className="relative">
          <textarea
            maxLength={160}
            className="bg-transparent resize-none px-2 pb-2.5
          outline-[#333639] outline outline-1 rounded-md w-full pt-6 
            focus:outline-2 focus:outline-[#1d9bf0] peer"
            value={bioContent}
            rows={4}
            onChange={(e) => setBioContent(e.target.value)}
            required
          ></textarea>
          <div
            className="absolute text-[#71767b] left-2 top-3.5 
         peer-focus:text-sm peer-valid:text-sm text-xl peer-focus:top-1 peer-valid:top-1 duration-150"
          >
            Bio
          </div>
        </div>

        <div className="relative">
          <input
            maxLength={30}
            className="bg-black outline-[#333639] outline outline-1 rounded-md
            px-2 pb-2.5 w-full pt-6 focus:outline-2 focus:outline-[#1d9bf0] peer"
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />
          <div
            className="absolute text-[#71767b] left-2 top-3.5 text-xl
          peer-focus:text-sm peer-valid:text-sm peer-focus:top-1 peer-valid:top-1 duration-150"
          >
            Location
          </div>
        </div>

        <div className="relative">
          <input
            maxLength={100}
            className="bg-black outline-[#333639] outline outline-1 rounded-md
            px-2 pb-2.5 w-full pt-6 focus:outline-2 focus:outline-[#1d9bf0] peer"
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
          />
          <div
            className="absolute text-[#71767b] left-2 top-3.5 text-xl
          peer-focus:text-sm peer-valid:text-sm peer-focus:top-1 peer-valid:top-1 duration-150"
          >
            Website
          </div>
        </div>
      </div>
    </div>
  );
};
export default EditProfileModal;
