/* eslint-disable @next/next/no-img-element */

'use client';

import React, { createContext, useRef, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, addDoc, getDocs, collection } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInHours from 'date-fns/differenceInHours';
import { v4 } from 'uuid';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase.tsx';
import RightSidebar from '../components/RightSidebar.tsx';
import LeftSidebar from '../components/LeftSidebar.tsx';
import LoadingPage from '../components/LoadingPage.tsx';

export const HelloContext = React.createContext();

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = getAuth();
  const router = useRouter();
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState();
  const nickname = useRef('');
  const [userNickname, setUserNickname] = useState('');
  const [showLoading, setShowLoading] = useState<boolean>(false);

  useEffect(() => {
    let authFlag = true;
    onAuthStateChanged(auth, async (user: any) => {
      if (authFlag) {
        authFlag = false;
        if (user) {
          setCurrentLoggedInUser(user);
          const usersCollectionRef = collection(db, 'users');
          const data = await getDocs(usersCollectionRef);
          let newUser = true;
          data.docs.map((document) => {
            if (document.data().userId === user.uid) {
              newUser = false;
              nickname.current = document.data().userNickname; // sets current nickname to stored NN
              setUserNickname(document.data().userNickname);
            }
          });
          const monthAndYear = `${new Date().toLocaleString('default', {
            month: 'long',
          })} ${new Date().getFullYear()}`;

          if (newUser) {
            const randomNumber = Math.floor(Math.random() * 9000);
            const nameSplit = user.displayName?.split(' ').join('');
            const generateNickname = `${nameSplit}${randomNumber}`;
            nickname.current = generateNickname; // else sets current nickname as new generated one
            setUserNickname(generateNickname);

            addDoc(usersCollectionRef, {
              userId: auth?.currentUser?.uid,
              userName: auth?.currentUser?.displayName,
              userNickname: generateNickname,
              userProfileImg: auth?.currentUser?.photoURL,
              followers: [],
              following: [],
              joinedDate: monthAndYear,
              website: '',
              bio: '',
              locaton: '',
            });
          }
          newUser = false;
        } else {
          setShowLoading(true);
          console.log(`No signed in users, returning to login page....`);
          router.push('/');
        }
      }
    });
  }, []);

  const tweetsCollectionRef = collection(db, 'tweets'); // holds all tweets
  const [allTweets, setAllTweets] = useState<{}>([]);

  const getAllTweets = async () => {
    try {
      const data = await getDocs(tweetsCollectionRef);
      const filteredData = data.docs.map((document) => ({
        ...document.data(),
        id: document.id,
      }));

      const sortedTweets = filteredData.sort((a: any, b: any) => {
        const dateA = parse(a.date, 'dd/MM/yyyy, HH:mm:ss', new Date());
        const dateB = parse(b.date, 'dd/MM/yyyy, HH:mm:ss', new Date());
        return dateB - dateA;
      });

      const DateSortedTweets = sortedTweets.map((tweet: Object) => {
        const parsedDateFirst = parse(
          tweet.date,
          'dd/MM/yyyy, HH:mm:ss',
          new Date()
        );
        const formattedDate = format(parsedDateFirst, 'yyyy-MM-dd HH:mm:ss');
        const parsedDate = parse(
          formattedDate,
          'yyyy-MM-dd HH:mm:ss',
          new Date()
        );
        const differenceSecs = differenceInSeconds(new Date(), parsedDate);
        const differenceMins = differenceInMinutes(new Date(), parsedDate);
        const differenceHrs = differenceInHours(new Date(), parsedDate);

        let finalDate;
        if (differenceSecs < 2) {
          finalDate = `now`;
        } else if (differenceSecs < 60) {
          finalDate = `${differenceSecs}s`;
        } else if (differenceMins < 60) {
          finalDate = `${differenceMins}m`;
        } else if (differenceHrs < 24) {
          finalDate = `${differenceHrs}h`;
        } else {
          finalDate = format(parsedDate, 'dd MMM');
        }
        return { ...tweet, date: finalDate };
      });
      setAllTweets(DateSortedTweets);
    } catch (err) {
      console.error(err);
    }
  };

  const [imageURL, setImageURL] = useState('');
  const [imageID, setImageID] = useState('');
  const [tweetContent, setTweetContent] = useState('');
  const [imageUpload, setImageUpload] = useState<any>();
  const [imagePreview, setImagePreview] = useState('');

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const onSubmitTweet = async () => {
    document.querySelector('.everyonecanreply')?.classList.add('hidden');
    document.querySelector('.everyonedropdown')?.classList.add('hidden');
    try {
      await addDoc(tweetsCollectionRef, {
        text: tweetContent,
        authorId: auth?.currentUser?.uid,
        date: new Date().toLocaleString('en-GB', options),
        authorName: auth?.currentUser?.displayName,
        authorNickname: nickname.current,
        likedBy: [],
        replies: 0,
        isAReply: false,
        parentTweet: null,
        parentTweetNickname: null,
        authorProfileImg: auth?.currentUser?.photoURL,
        image: { imageId: imageID, imageUrl: imageURL },
      });
      getAllTweets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    setImageUpload(e.target.files[0]);
    if (e.target.files.length) {
      if (e.target.files[0].size < 10000000) {
        const img = URL.createObjectURL(e.target.files[0]);
        setImagePreview(img);
        if (!isCreateTweetModalOpen) {
          document
            .querySelector('.everyonecanreply')
            ?.classList.remove('hidden');
          document
            .querySelector('.everyonedropdown')
            ?.classList.remove('hidden');
        }
      } else alert('Image size is too big!');
    }
  };

  const uploadFile = async () => {
    setImagePreview('');
    document.getElementById('pickimage')!.value = ''; // allows onchange to fire every time

    if (imageUpload === undefined) {
      setImageURL('');
      setImageID('');
      setImageUpload();
      setTweetContent('');
      onSubmitTweet();
      return;
    }
    const imageName = v4() + imageUpload.name;
    const filesFolderRef = ref(storage, `tweetImage/${imageName}`);
    const snapshot = await uploadBytes(filesFolderRef, imageUpload);
    const url = await getDownloadURL(snapshot.ref);

    setImageURL(url);
    setImageID(imageName);
    setImageUpload();
  };

  const renderPreview = () => (
    <div className="relative">
      <button
        onClick={() => {
          setImageUpload();
          setImagePreview('');
        }}
        className="absolute p-2 bg-[#0f1419bf] ml-1 mt-1 rounded-full backdrop-blur-[4px] 
      hover:bg-[#1e262ebf] duration-150"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          height={18}
          width={18}
          className="fill-white"
        >
          <g>
            <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
          </g>
        </svg>
      </button>
      <img
        src={imagePreview}
        alt={`preview of image`}
        className="rounded-xl max-w-[100%] max-h-[300px]"
      />
    </div>
  );

  const [isCreateTweetModalOpen, setIsCreateTweetModalOpen] =
    useState<boolean>(false);

  const clearInputs = () => {
    setTweetContent('');
    setImageUpload();
    setImagePreview('');
    document.querySelector('.everyonecanreply')?.classList.add('hidden');
    document.querySelector('.everyonedropdown')?.classList.add('hidden');
  };

  const [whoToFollowTab, setWhoToFollowTab] = useState<Array>([]);

  const refreshWhoToFollowTab = async () => {
    const walterRef = doc(db, 'users', 'Gu7cpPmDQAxlhd3TazFl');
    const walter = await getDoc(walterRef);
    const walterData = { ...walter.data(), docUserId: walter.id };

    const aangRef = doc(db, 'users', 'yC37BTRrPSALvdcLXDFx');
    const aang = await getDoc(aangRef);
    const aangData = { ...aang.data(), docUserId: aang.id };

    const batmanRef = doc(db, 'users', 'Kn4yGgl04xxIirpIjnkF');
    const batman = await getDoc(batmanRef);
    const batmanData = { ...batman.data(), docUserId: batman.id };

    const demos = [];
    demos.push(walterData);
    demos.push(aangData);
    demos.push(batmanData);
    setWhoToFollowTab(demos);
  };

  const usersCollectionRef = collection(db, 'users');

  const [profileData, setProfileData] = useState<Object>({});

  const getProfileData = async (nickname: string) => {
    const id = nickname;
    const data = await getDocs(usersCollectionRef);
    const filteredData = data.docs.map((document) => {
      if (id === document.data().userNickname) {
        return { ...document.data(), docId: document.id };
      }
    });
    const profData = filteredData.filter((user) => user !== undefined);
    setProfileData(profData[0]);
  };

  const searchParams = useSearchParams();
  const profileDocId = searchParams.get('id');
  const [profileDetails, setProfileDetails] = useState<Object>({});
  const [userList, setUserList] = useState([]);

  const getList = async (followersOrFollowing: String) => {
    const userRef = doc(db, 'users', profileDocId);
    const list = await getDoc(userRef);
    setProfileDetails(list.data());
    if (followersOrFollowing === 'followers') {
      setUserList(list?.data()?.followers);
    } else {
      setUserList(list?.data()?.following);
    }
  };

  return (
    <div className="App bg-black h-full w-full">
      <div className="app-container">
        {showLoading && <LoadingPage />}
        <HelloContext.Provider
          value={{
            nickname,
            tweetContent,
            setTweetContent,
            imagePreview,
            handleImageChange,
            setImagePreview,
            setImageUpload,
            imageUpload,
            imageURL,
            uploadFile,
            allTweets,
            getAllTweets,
            onSubmitTweet,
            setImageID,
            setImageURL,
            renderPreview,
            isCreateTweetModalOpen,
            setIsCreateTweetModalOpen,
            clearInputs,
            refreshWhoToFollowTab,
            whoToFollowTab,
            getProfileData,
            setProfileData,
            profileData,
            getList,
            profileDetails,
            userList,
            setUserList,
            setProfileDetails,
          }}
        >
          <LeftSidebar
            userNickname={userNickname}
            currentLoggedInUser={currentLoggedInUser}
          />
          {children}

          <RightSidebar currentLoggedInUser={currentLoggedInUser} />
        </HelloContext.Provider>
      </div>
    </div>
  );
}
