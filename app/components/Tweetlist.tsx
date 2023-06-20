import { FC } from 'react';
import Link from 'next/link';

const Tweetlist: FC = ({ allTweets, auth, deleteTweet, likeTweet }: any) => {
  //   let something;

  console.log(allTweets);

  return (
    <>
      {allTweets.map((tweet: any) => {
        // reply tweets are filtered out for timeline.
        if (!tweet.isAReply) {
          return (
            <Link
              href={`/tweet/${tweet.id}`}
              key={tweet.id}
              className="flex gap-3 p-4 border border-zinc-800"
            >
              <div>img </div>
              <div>
                <div className="flex gap-0.5">
                  <div className=" font-bold">{tweet.authorName}</div>
                  <div>@{tweet.authorNickname}</div>
                  <span>·</span>
                  <div className="text-sm text-slate-400">{tweet.date}</div>
                </div>
                <div className="">{tweet.text}</div>
                <div className="flex justify-evenly">
                  <button>Comment</button>
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
};

export default Tweetlist;
