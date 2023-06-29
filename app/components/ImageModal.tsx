/* eslint-disable @next/next/no-img-element */
import { FC, useEffect, useRef } from 'react';

export const ImageModal: FC = ({ setShowImageModal, showImageModal }: any) => {
  const modalRef = useRef<HTMLTextAreaElement | null>(null);

  const handleClickOutside = (event: Object) => {
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
