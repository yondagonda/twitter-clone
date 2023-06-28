/* eslint-disable @next/next/no-img-element */
import { FC, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import Userlist from './Userlist';

export const ImageModal: FC = ({ setShowImageModal, showImageModal }: any) => {
  const modalRef = useRef(null);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowImageModal({
        url: '',
        show: false,
      });
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  return (
    <div
      className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
  rounded-lg"
      ref={modalRef}
    >
      <img className="w-max" src={showImageModal.url} alt="image full sized" />
    </div>
  );
};
export default ImageModal;
