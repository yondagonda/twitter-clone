import { FC, useEffect, useRef } from 'react';
import Userlist from './Userlist.tsx';

export const LikesModal: FC = ({
  showLikesModal,
  setShowLikesModal,
  likedBy,
}: any) => {
  const modalRef = useRef<HTMLTextAreaElement | null>(null);

  const handleClickOutside = (event: Object) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowLikesModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  return (
    <div
      className="fixed  w-[85%] sm:w-[500px] h-[600px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
  bg-black rounded-lg"
      ref={modalRef}
    >
      <div className="flex gap-6 items-center p-5">
        <button onClick={() => setShowLikesModal(false)}>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            width={20}
            height={20}
            className="fill-[#eff3f4]"
          >
            <g>
              <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
            </g>
          </svg>
        </button>
        <div className="text-xl font-bold">Liked By</div>
      </div>

      {likedBy.length > 0 && <Userlist likedBy={likedBy} />}
    </div>
  );
};
export default LikesModal;
