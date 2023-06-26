export default function RightSidebar() {
  return (
    <div className=" h-full py-4 text-[#e7e9ea] hidden lg:block">
      <div
        className="pl-3 xl:ml-4 flex flex-col gap-4 fixed
      w-full max-w-[28%] xl:max-w-[368px] xl:w-full removefixed"
      >
        <div className="relative">
          <input
            id="test"
            className="bg-[#202327] rounded-3xl py-3 px-4 outline-none w-full pl-[44px]
            focus:outline-[#1d9bf0] focus:bg-black outline-1 peer"
            placeholder="Search Twitter"
            type="text"
          ></input>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            height={22}
            width={21}
            className="fill-[#71767b] absolute left-[12px] top-[13px] peer-focus:fill-[#1d9bf0]"
          >
            <g>
              <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
            </g>
          </svg>
        </div>
        <div className="p-3 bg-[#16181c] rounded-2xl text-[#e7e9ea] flex flex-col gap-1.5">
          <div className="text-xl font-bold">Get Verified</div>
          <div className="font-bold ">Subscribe to unlock new features.</div>
          <button className="bg-[#1d9bf0] px-4 py-1 rounded-3xl font-bold text-white w-fit">
            Get Verified
          </button>
        </div>
        <div className=" bg-[#16181c] rounded-2xl text-[#e7e9ea]">
          <div className="text-xl font-bold p-3">What's happening</div>
          <div className="w-full px-3 py-4 hover:bg-[#1d1f24] duration-100 text-[15.2px]">
            some news
          </div>
          <div className="w-full px-3 py-4  hover:bg-[#1d1f24] duration-100 text-[15.2px]">
            some news
          </div>
          <div className="w-full px-3 py-4 hover:bg-[#1d1f24] duration-100 text-[15.2px]">
            some news
          </div>
          <div className="w-full px-3 py-4 hover:bg-[#1d1f24] duration-100 text-[15.2px]">
            some news
          </div>
          <div className="w-full px-3 py-4 rounded-b-2xl hover:bg-[#1d1f24] duration-100 text-[#1d9bf0]">
            Show more
          </div>
        </div>
        <div className="bg-[#16181c] rounded-2xl text-[#e7e9ea]">
          <div className="p-3 text-xl font-bold">Who to follow</div>
          <div className="w-full px-3 py-4 hover:bg-[#1d1f24] duration-100 text-[15.2px]">
            some person
          </div>
          <div className="w-full px-3 py-4 hover:bg-[#1d1f24] duration-100 text-[15.2px]">
            some person
          </div>
          <div className="w-full px-3 py-4 hover:bg-[#1d1f24] duration-100 text-[15.2px]">
            some person
          </div>
          <div className="w-full px-3 py-4 rounded-b-2xl hover:bg-[#1d1f24] duration-100 text-[#1d9bf0]">
            Show more
          </div>
        </div>
      </div>
    </div>
  );
}
