/* eslint-disable @next/next/no-img-element */
import { FC } from 'react';
import Link from 'next/link';

const Tweetlist: FC = ({ allTweets, auth, deleteTweet, likeTweet }: any) => (
  <>
    {allTweets.map((tweet: any) => {
      // keep in mind reply tweets are filtered out of the timeline.
      if (!tweet.isAReply) {
        return (
          <Link
            href={`/tweet/${tweet.id}`}
            key={tweet.id}
            className="flex gap-3 p-4 border-t-[1.5px] border-zinc-800"
          >
            <div>
              <img
                src={`${tweet?.authorProfileImg}`}
                className="h-8 rounded-full min-w-[32px]"
                alt="profile photo"
              />
            </div>
            <div>
              <div className="flex gap-0.5">
                <div className=" font-bold">{tweet.authorName}</div>
                <div>@{tweet.authorNickname}</div>
                <span>·</span>
                <div className="text-sm text-slate-400">{tweet.date}</div>
              </div>
              <div className="">{tweet.text}</div>

              {tweet.image.imageId !== 'empty' && (
                <div className="max-w-[50%]">
                  <img
                    src={tweet.image.imageUrl}
                    alt="image"
                    className="rounded-xl"
                  />
                </div>
              )}

              <div className="flex justify-evenly">
                <button>{tweet.replies} Comment</button>
                <button
                  className="text-sm"
                  onClick={(e) => likeTweet(e, tweet)}
                >
                  {tweet.likedBy.length} Like
                </button>
              </div>

              {auth?.currentUser?.uid === tweet.authorId && (
                <button
                  className="text-sm"
                  onClick={(e) => deleteTweet(e, tweet)}
                >
                  Delete Tweet
                </button>
              )}
            </div>
          </Link>
        );
      }
    })}
  </>
);
export default Tweetlist;
