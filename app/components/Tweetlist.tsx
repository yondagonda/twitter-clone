import { FC } from 'react';
import Link from 'next/link';

const Tweetlist: FC = ({ allTweets, auth, deleteTweet }: any) => (
  <>
    {allTweets.map((tweet: any) => (
      // need to disable propagation on delete button
      <Link
        href={`/tweet/${tweet.id}`}
        key={tweet.id}
        onClick={() => console.log(tweet)}
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
          {auth?.currentUser?.uid === tweet.authorId && (
            <button onClick={() => deleteTweet(tweet)}>Delete Tweet</button>
          )}
        </div>
      </Link>
    ))}
  </>
);

export default Tweetlist;
