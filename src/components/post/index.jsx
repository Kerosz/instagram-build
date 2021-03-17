import { useRef, useState } from 'react';
import { Image } from 'cloudinary-react';
import { formatDistance } from 'date-fns';
import PropTypes from 'prop-types';
import Header from './header';
import Comments from './comments';
import Actions from './actions';
import AddComment from './add-comment';
import Recommended from './recommended';

export default function Post({ postData }) {
  const {
    imageSrc,
    caption,
    comments,
    docId,
    photoId,
    likes,
    dateCreated,
  } = postData.post;

  const [postComments, setPostComments] = useState(comments);

  const commentInputRef = useRef(null);

  function handleCommentInputFocus() {
    commentInputRef.current.focus();
  }

  return (
    <>
      <div
        className="bg-white border border-gray-primary rounded grid grid-cols-8 mb-14"
        style={{ maxHeight: '781px' }}
      >
        <div className="bg-gray-100 col-span-5 flex items-center">
          <Image
            cloudName={process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}
            publicId={imageSrc}
            width="680"
            crop="scale"
            alt={caption}
            className="object-contain"
          />
        </div>
        <div
          className="col-span-3 flex flex-col"
          style={{ maxHeight: '780px' }}
        >
          <Header postUser={postData.user} />
          <Comments
            caption={caption}
            postUser={postData.user}
            postComments={postComments}
          />
          <Actions
            postDocId={docId}
            postId={photoId}
            totalLikes={likes.length}
            likedPost={postData.userLikedPhoto}
            savedPost={postData.userSavedPhoto}
            handleCommentFocus={handleCommentInputFocus}
          />
          <p className="text-gray-base uppercase text-xs my-2 px-4">
            {formatDistance(dateCreated, new Date())} ago
          </p>
          <AddComment
            postDocId={docId}
            commentInputRef={commentInputRef}
            setPostComments={setPostComments}
          />
        </div>
      </div>
      <Recommended
        postId={photoId}
        userId={postData.user.userId}
        username={postData.user.username}
      />
    </>
  );
}

Post.propTypes = {
  postData: PropTypes.shape({
    post: PropTypes.shape({
      docId: PropTypes.string,
      caption: PropTypes.string,
      comments: PropTypes.arrayOf(
        PropTypes.shape({
          comment: PropTypes.string,
          dateCreated: PropTypes.number,
          displayName: PropTypes.string,
          id: PropTypes.string,
          userId: PropTypes.string,
        }),
      ),
      dateCreated: PropTypes.number,
      imageSrc: PropTypes.string,
      likes: PropTypes.arrayOf(PropTypes.string),
      photoId: PropTypes.string,
      saved: PropTypes.arrayOf(PropTypes.string),
      sourceURL: PropTypes.string,
      userId: PropTypes.string,
    }),
    user: PropTypes.shape({
      userId: PropTypes.string,
      username: PropTypes.string,
      photoURL: PropTypes.string,
      verifiedUser: PropTypes.bool,
      docId: PropTypes.string,
      followers: PropTypes.arrayOf(PropTypes.string),
    }),
    userLikedPhoto: PropTypes.bool,
    userSavedPhoto: PropTypes.bool,
  }).isRequired,
};
