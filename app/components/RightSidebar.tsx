export default function RightSidebar() {
  return (
    <div className="right-0 h-full dark:bg-zinc-800 border py-4 text-white fixed">
      <div className="px-0 flex flex-col gap-4">
        <div className="">
          <input
            className="bg-zinc-800 rounded-3xl py-2 px-4"
            placeholder="Search Twitter"
            type="text"
          ></input>
        </div>
        <div className="p-2 bg-zinc-800 rounded-xl">
          <div className="text-xl font-bold">Get Verified</div>
          <div>Subscribe to unlock new features.</div>
          <button className="bg-blue-500 px-4 py-1 rounded-3xl">
            Get Verified
          </button>
        </div>
        <div className="p-2 bg-zinc-800 rounded-xl">
          <div className="text-xl font-bold">What's happening</div>
        </div>
        <div className="p-2 bg-zinc-800 rounded-xl">
          <div className="text-xl font-bold">Who to follow</div>
        </div>
      </div>
    </div>
  );
}
