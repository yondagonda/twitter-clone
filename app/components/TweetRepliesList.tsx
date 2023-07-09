/* eslint-disable @next/next/no-img-element */
import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import displayMiniMenuModal from './modals/displayMiniMenuModal.tsx';

export const TweetRepliesList: FC = ({
  repliesOnly,
  auth,
  deleteTweet,
  likeTweet,
}: any) => {
  const router = useRouter();

  return (
    <section>
      {repliesOnly.map((tweet: any, index: number) => {
        // Filters out tweets which arent replies
        if (tweet.isAReply) {
          return (
            <article
              key={tweet.id}
              className="border-b-[1px] border-[#2f3336] flex hover:bg-[#0a0a0a] w-full"
            >
              <Link className="h-0" href={`/user/${tweet.authorNickname}`}>
                <img
                  src={`${tweet?.authorProfileImg}`}
                  className=" rounded-full h-10 ml-4 mt-4 hover:brightness-[.85] duration-200
                  max-w-[40px] w-full object-cover"
                  alt="profile photo"
                />
              </Link>
              <Link
                href={`/tweet/${tweet.id}`}
                className="w-full px-3 pt-3 pb-1 flex justify-between relative"
              >
                <div className="pl-1.5 w-full">
                  <div className="flex gap-1 flex-col">
                    <div>
                      <div className="flex gap-0.5 items-center">
                        <Link
                          href={`/user/${tweet.authorNickname}`}
                          className=" font-bold hover:underline text-[15.2px] truncate"
                        >
                          {tweet.authorName}
                        </Link>
                        <div className="text-[#71767b] text-[15.2px] truncate">
                          @{tweet.authorNickname}
                        </div>
                        <span className="text-[#71767b] px-0.5">·</span>
                        <time className=" text-[#71767b] text-[15.2px]">
                          {tweet.date}
                        </time>
                      </div>
                      <div className="flex gap-1">
                        <div className="text-[#71767b] text-[15.2px]">
                          Replying to
                        </div>
                        <button
                          className="group"
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/user/${tweet.parentTweetNickname}`);
                          }}
                        >
                          <div className="group-hover:underline text-[#1d9bf0] text-[15.2px]">
                            @{tweet.parentTweetNickname}
                          </div>
                        </button>
                      </div>
                      <p className="break-all text-[15.2px] leading-6 py-1.5 sm:py-0">
                        {tweet.text}
                      </p>

                      {tweet.image.imageId !== '' && (
                        <div className="max-w-[50%] pb-2 relative">
                          <Image
                            width={0}
                            height={0}
                            sizes="100vw"
                            src={tweet.image.imageUrl}
                            alt="image"
                            className="rounded-xl w-auto h-auto"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-around items-center">
                      <button className="flex items-center gap-2">
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          height={18}
                          width={18}
                          className="fill-[#71767b]"
                        >
                          <g>
                            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                          </g>
                        </svg>

                        {tweet.replies !== 0 && (
                          <span className="text-[13px]">{tweet.replies}</span>
                        )}
                      </button>
                      <div>
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          height={18}
                          width={18}
                          className="fill-[#71767b]"
                        >
                          <g>
                            <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
                          </g>
                        </svg>
                      </div>
                      <button
                        className="text-sm flex gap-2 items-center group"
                        onClick={(e) => likeTweet(e, tweet)}
                      >
                        {tweet.likedBy.includes(auth?.currentUser?.uid) ? (
                          <div className="p-2 rounded-full group-hover:bg-[#250313] duration-200">
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              height={18}
                              width={18}
                              fill="rgb(249, 24, 128)"
                            >
                              <g>
                                <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                              </g>
                            </svg>
                          </div>
                        ) : (
                          <div
                            className="p-2 rounded-full group-hover:bg-[#250313] 
                          group-hover:fill-[#f91880] fill-[#71767b] duration-200"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              height={18}
                              width={18}
                            >
                              <g>
                                <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                              </g>
                            </svg>
                          </div>
                        )}
                        {tweet.likedBy.length !== 0 && (
                          <div className="text-[#71767b] text-[13px] group-hover:text-[#f91880]">
                            {tweet.likedBy.length}
                          </div>
                        )}
                      </button>
                      <div>
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          height={18}
                          width={18}
                          className="fill-[#71767b]"
                        >
                          <g>
                            <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="h-fit group selected p-2 hover:bg-[#02111b] rounded-full duration-200
                  absolute top-1.5 right-1.5"
                  onClick={(e) => {
                    e.preventDefault();
                    displayMiniMenuModal(e, tweet, deleteTweet, router);
                  }}
                  data-id={index}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    height={20}
                    width={20}
                    className="fill-[#71767b] group-hover:fill-[#1d9bf0]"
                  >
                    <g>
                      <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                    </g>
                  </svg>
                </button>
              </Link>
            </article>
          );
        }
      })}
    </section>
  );
};
export default TweetRepliesList;
