import { FC } from 'react';
import Link from 'next/link';

const Tweetlist: FC = ({ allTweets, auth, deleteTweet, likeTweet }: any) => {
  let something;

  return (
    <>
      {allTweets.map((tweet: any) => (
        <Link
          href={`/tweet/${tweet.id}`}
          key={tweet.id}
          className="flex gap-3 p-4 border border-slate-700"
        >
          <div>img </div>
          <div>
            <div className="flex gap-0.5">
              <div className="text-zinc-800 font-bold">{tweet.authorName}</div>
              <div>@{tweet.authorNickname}</div>
              <span>·</span>
              <div>{tweet.date}</div>
            </div>
            <div className="text-gray-700">{tweet.text}</div>
            <div className="flex justify-evenly">
              <button>Comment</button>
              <button className="text-sm" onClick={(e) => likeTweet(e, tweet)}>
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
      ))}
    </>
  );
};

export default Tweetlist;
