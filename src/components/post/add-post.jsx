/* eslint-disable no-unused-vars */
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'cloudinary-react';
import { v4 as uuid } from 'uuid';
import { uploadUnsignedImage } from '../../services/cloudinary';
import { createPost } from '../../services/firebase';

export default function AddPost({
  userData,
  postButtonRef,
  displayModal,
  setDisplayStatus,
}) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [postMessage, setPostMessage] = useState('');

  function handleImageUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    setUploadedImage(file);

    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.readyState === 2) {
        setPreviewImage(reader.result);
      }
    };
  }

  function handleModalClose() {
    setUploadedImage(null);
    setPreviewImage(null);
    setPostMessage('');
    setDisplayStatus((prev) => !prev);
  }

  async function handleNewPostSubmit(event) {
    event.preventDefault();

    const cloudinaryResponse = await uploadUnsignedImage(
      uploadedImage,
      userData.displayName,
    );

    const postDataObject = {
      caption: postMessage,
      comments: [],
      dateCreated: Date.now(),
      imageSrc: cloudinaryResponse.public_id,
      sourceURL: cloudinaryResponse.secure_url,
      likes: [],
      saved: [],
      photoId: uuid(),
      userId: userData.uid,
    };

    await createPost(postDataObject);

    handleModalClose();
  }

  return (
    <div
      className={`${
        displayModal ? 'absolute' : 'hidden'
      } flex justify-center items-center inset-0`}
    >
      <div
        aria-hidden
        className="fixed z-30 inset-0 bg-black-faded"
        onClick={handleModalClose}
      />
      <div
        className="absolute z-40 bg-white max-w-screen-sm w-full flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Add post modal"
      >
        <div className="p-2.5 px-3.5 border-b border-gray-primary w-full flex">
          <button
            type="button"
            aria-label="Close modal"
            onClick={handleModalClose}
          >
            <svg
              className="w-7 text-black-light cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex p-2 px-3.5">
          <Image
            cloudName={process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}
            publicId={userData.photoURL}
            alt={`${userData.username} profile`}
            width="48"
            crop="scale"
            className="rounded-full h-12 w-12 flex mr-5"
          />
          <form
            className="w-full flex flex-col items-start"
            onSubmit={handleNewPostSubmit}
          >
            <textarea
              name="message"
              rows={3}
              placeholder="What's happening?"
              className="w-full focus:outline-none pb-3 mt-2 text-lg overflow-y-hidden resize-none"
              onChange={({ target }) => setPostMessage(target.value)}
              value={postMessage}
            />
            {previewImage && (
              <img
                className="rounded-2xl mb-2 min-w-full max-h-80 object-contain"
                src={previewImage}
                alt="Uploaded"
              />
            )}
            <div className="pt-2 flex justify-between items-center w-full border-t border-gray-primary">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white"
              >
                <svg
                  className="w-7 text-black-light"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleImageUpload}
                />
              </label>
              <button
                type="submit"
                className={`font-bold text-blue-medium ${
                  postMessage.length < 1 && 'opacity-25 cursor-default'
                } mr-1`}
                disabled={postMessage.length < 1}
                onClick={handleNewPostSubmit}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

AddPost.propTypes = {
  userData: PropTypes.objectOf(PropTypes.any).isRequired,
  postButtonRef: PropTypes.objectOf(PropTypes.any).isRequired,
  displayModal: PropTypes.bool.isRequired,
  setDisplayStatus: PropTypes.func.isRequired,
};
