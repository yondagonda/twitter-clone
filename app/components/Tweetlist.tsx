/* eslint-disable @next/next/no-img-element */
import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import ImageModal from './ImageModal';

export const Tweetlist: FC = ({
  allTweets,
  auth,
  deleteTweet,
  likeTweet,
}: any) => {
  const [showImageModal, setShowImageModal] = useState({
    url: '',
    show: false,
  });
  const router = useRouter();

  const handleClickOutside = (event) => {
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    if (modal && !modal.contains(event.target)) {
      modal.remove();
      overlay?.remove();
    }
  };

  const enablePopup = (e, tweet) => {
    const selected = e.target.closest('[data-id]');
    const overlay = document.createElement('div');
    overlay.classList.add(
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'bottom-0',
      'z-[1]',
      'overlay'
    );
    const modal = document.createElement('div');

    modal.classList.add(
      'fixed',
      'modal',
      'flex',
      'flex-col',
      'z-[10]',
      'bg-black',
      'translate-x-[-160px]',
      'translate-y-[-20px]',
      'rounded-lg'
    );
    selected.appendChild(modal);
    selected.appendChild(overlay);
    // DELETE BUTTON
    if (auth.currentUser.uid === tweet.authorId) {
      const deleteBtnContainer = document.createElement('div');

      const svgElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      svgElement.setAttribute('viewBox', '0 0 24 24');
      svgElement.setAttribute('height', '20');
      svgElement.classList.add('fill-[#f4212e]');
      const gElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g'
      );
      const pathElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      pathElement.setAttribute(
        'd',
        'M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z'
      );
      gElement.appendChild(pathElement);
      svgElement.appendChild(gElement);
      deleteBtnContainer.appendChild(svgElement);

      const deleteBtnText = document.createElement('div');
      deleteBtnText.innerHTML = 'Delete Tweet';
      deleteBtnContainer.classList.add(
        'px-6',
        'py-2',
        'rounded-lg',
        'hover:bg-[#0a0a0a]',
        'font-bold',
        'text-[#f4212e]',
        'gap-3',
        'flex',
        'items-center'
      );
      deleteBtnContainer.addEventListener('click', (e) => {
        e.preventDefault();
        deleteTweet(e, tweet);
        modal.remove();
        overlay.remove();
      });
      deleteBtnContainer.appendChild(deleteBtnText);
      modal.appendChild(deleteBtnContainer);
    }
    // VIEW PAGE BUTTON
    const visitPageBtnContainer = document.createElement('div');
    const svgElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    svgElement.setAttribute('viewBox', '0 0 24 24');
    svgElement.setAttribute('height', '20');
    svgElement.classList.add('fill-[#e7e9ea]');
    const gElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    const pathElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    pathElement.setAttribute(
      'd',
      'M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 4v3h2v-3h3V8h-3V5h-2v3h-3v2h3zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z'
    );
    gElement.appendChild(pathElement);
    svgElement.appendChild(gElement);
    visitPageBtnContainer.appendChild(svgElement);

    const visitPageBtnText = document.createElement('div');
    visitPageBtnText.innerHTML = `Visit @${tweet.authorNickname}`;
    visitPageBtnContainer.classList.add(
      'px-6',
      'py-2',
      'rounded-lg',
      'hover:bg-[#0a0a0a]',
      'font-bold',
      'text-[#e7e9ea]',
      'gap-3',
      'flex',
      'items-center'
    );
    visitPageBtnContainer.addEventListener('click', (e) => {
      e.preventDefault();
      router.push(`/user/${tweet.authorNickname}`);
      modal.remove();
      overlay.remove();
    });
    visitPageBtnContainer.appendChild(visitPageBtnText);
    modal.appendChild(visitPageBtnContainer);

    document.addEventListener('mousedown', handleClickOutside);
  };

  return (
    <>
      {allTweets.map((tweet: any, index) => {
        // keep in mind reply tweets are filtered out of the timeline.
        if (!tweet.isAReply) {
          return (
            <div
              key={tweet.id}
              className="border-t-[1px] border-[#2f3336] flex"
            >
              <Link className="h-0" href={`/user/${tweet.authorNickname}`}>
                <img
                  src={`${tweet?.authorProfileImg}`}
                  className="h-10 ml-4 mt-4 rounded-full min-w-[40px]"
                  alt="profile photo"
                />
              </Link>
              <Link
                href={`/tweet/${tweet.id}`}
                className="flex justify-between w-full p-3 
                hover:bg-[#0a0a0a]"
              >
                <div className="flex gap-3">
                  <div className="pr-0.5">
                    <div className="flex gap-0.5 items-center">
                      <div className=" font-bold">{tweet.authorName}</div>
                      <div className="text-slate-400">
                        @{tweet.authorNickname}
                      </div>
                      <span>·</span>
                      <div className=" text-slate-400">{tweet.date}</div>
                    </div>
                    <div className="pb-2 break-all">{tweet.text}</div>

                    {tweet.image.imageId !== '' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowImageModal({
                            url: tweet.image.imageUrl,
                            show: true,
                          });
                        }}
                        className="max-w-[60%] mb-2 relative"
                      >
                        <Image
                          width={0}
                          height={0}
                          sizes="100vw"
                          src={tweet.image.imageUrl}
                          alt="image"
                          className="rounded-xl w-auto h-auto"
                        />
                      </button>
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
                <button
                  className="h-0 group selected"
                  onClick={(e) => {
                    e.preventDefault();
                    enablePopup(e, tweet);
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
            </div>
          );
        }
      })}
      {showImageModal.show && (
        <div className="bg-blue-300/20 fixed top-0 left-0 right-0 bottom-0 z-[1]">
          <ImageModal
            setShowImageModal={setShowImageModal}
            showImageModal={showImageModal}
          />
        </div>
      )}
    </>
  );
};
export default Tweetlist;
