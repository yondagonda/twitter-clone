export default function RightSidebar() {
  return (
    <div
      className=" h-full py-4 text-white 
    rightsidebar hidden lg:block"
    >
      <div
        className="pl-3 xl:ml-4 flex flex-col gap-4 fixed 
      w-full max-w-[28%] xl:max-w-[368px] xl:w-full"
      >
        <div className="">
          <input
            className="bg-[#202327] rounded-3xl py-2 px-4 outline-none w-full
            focus:outline-[#1d9bf0] focus:bg-black outline-1"
            placeholder="Search Twitter"
            type="text"
          ></input>
        </div>
        <div className="p-2 bg-[#16181c] rounded-xl ">
          <div className="text-xl font-bold">Get Verified</div>
          <div>Subscribe to unlock new features.</div>
          <button className="bg-[#1d9bf0] px-4 py-1 rounded-3xl font-bold">
            Get Verified
          </button>
        </div>
        <div className="p-2 bg-[#16181c] rounded-xl">
          <div className="text-xl font-bold">What's happening</div>
        </div>
        <div className="p-2 bg-[#16181c] rounded-xl">
          <div className="text-xl font-bold">Who to follow</div>
        </div>
      </div>
    </div>
  );
}
