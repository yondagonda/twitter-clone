import { useRouter } from 'next/navigation';
import { auth } from '../config/firebase.tsx';

const handleClickOutside = (event) => {
  const modal = document.querySelector('.modal');
  const overlay = document.querySelector('.overlay');
  if (modal && !modal.contains(event.target)) {
    modal.remove();
    overlay?.remove();
  }
};

const displayMiniMenuModal = (e, tweet, deleteTweet, router) => {
  const selected = e.target.closest('[data-id]');
  console.log(selected);
  const overlay = document.createElement('div');
  overlay.classList.add(
    'fixed',
    'top-0',
    'left-0',
    'right-0',
    'bottom-0',
    'z-[5]',
    'overlay'
  );
  const modal = document.createElement('div');

  modal.classList.add(
    'absolute',
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
  if (auth?.currentUser?.uid === tweet.authorId) {
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
      'items-center',
      'whitespace-nowrap'
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
  const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
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
    'items-center',
    'whitespace-nowrap'
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

export default displayMiniMenuModal;
