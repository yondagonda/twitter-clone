/* eslint-disable @next/next/no-img-element */
import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Tweetlist: FC = ({
  allTweets,
  auth,
  deleteTweet,
  likeTweet,
}: any) => (
  <>
    {allTweets.map((tweet: any) => {
      // keep in mind reply tweets are filtered out of the timeline.
      if (!tweet.isAReply) {
        return (
          <div key={tweet.id} className="border-t-[1.5px] flex p-4 gap-3">
            <Link className="h-0" href={`/user/${tweet.authorNickname}`}>
              <img
                src={`${tweet?.authorProfileImg}`}
                className="h-8 rounded-full min-w-[32px]"
                alt="profile photo"
              />
            </Link>
            <Link
              href={`/tweet/${tweet.id}`}
              className="flex justify-between border-zinc-800 w-full"
            >
              <div className="flex gap-3">
                <div>
                  <div className="flex gap-0.5">
                    <div className=" font-bold">{tweet.authorName}</div>
                    <div>@{tweet.authorNickname}</div>
                    <span>·</span>
                    <div className="text-sm text-slate-400">{tweet.date}</div>
                  </div>
                  <div className="pb-2">{tweet.text}</div>

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

                  <div className="flex justify-evenly items-center">
                    <button className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        height={20}
                        width={20}
                        className="fill-slate-200"
                      >
                        <g>
                          <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                        </g>
                      </svg>

                      {tweet.replies}
                    </button>
                    <button
                      className="text-sm flex gap-2"
                      onClick={(e) => likeTweet(e, tweet)}
                    >
                      {tweet.likedBy.includes(auth?.currentUser?.uid) ? (
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          height={20}
                          width={20}
                          fill="rgb(249, 24, 128)"
                        >
                          <g>
                            <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                          </g>
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          height={20}
                          width={20}
                          className="fill-slate-100"
                        >
                          <g>
                            <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                          </g>
                        </svg>
                      )}
                      {tweet.likedBy.length}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pr-4 pt-4">
                {auth?.currentUser?.uid === tweet.authorId && (
                  <button
                    className="text-sm "
                    onClick={(e) => deleteTweet(e, tweet)}
                  >
                    Del
                  </button>
                )}
              </div>
            </Link>
          </div>
        );
      }
    })}
  </>
);
export default Tweetlist;
