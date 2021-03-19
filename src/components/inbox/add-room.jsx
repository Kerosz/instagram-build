import { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import Modal from '../modal';
import {
  doesUserExist,
  createRoom,
  getUserIdsByUsername,
} from '../../services/firebase';

export default function AddRoom({ isOpen, onClose, userId }) {
  const [recieverState, setReciever] = useState([]);
  const [inputValueState, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const isValid = recieverState.length >= 1 && recieverState.length <= 10;

  function handleModalClose() {
    setReciever([]);
    setInputValue('');
    setErrorMessage('');
    onClose();
  }

  async function handleRecieverInsertion() {
    setErrorMessage(null);

    if (recieverState.length >= 3) {
      setErrorMessage('A maximum of 3 participats is allowed');
      setInputValue('');

      return;
    }

    if (inputValueState.length >= 3) {
      const isUsernameValid = await doesUserExist(inputValueState);

      if (isUsernameValid) {
        setReciever((prevRecieverState) => [
          ...prevRecieverState,
          inputValueState,
        ]);
      } else {
        setErrorMessage('Username does not exist!');
      }
    } else {
      setErrorMessage('Username must be at leat 3 characters long.');
    }
    setInputValue('');
  }

  async function handleOpenNewRoom() {
    if (isValid) {
      const receiverIds = await getUserIdsByUsername(recieverState);

      if (receiverIds.includes(userId)) {
        setErrorMessage('You cannot send a message to yourself!');

        return;
      }

      const roomObject = {
        dateCreated: Date.now(),
        dateUpdated: Date.now(),
        messages: [],
        roomParticipants: [userId, ...receiverIds],
        roomId: uuid(),
      };

      await createRoom(roomObject);

      handleModalClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="New Message"
      maxW="md"
    >
      {errorMessage && (
        <p className="mb-1 mt-2 text-xs text-center text-red-primary">
          {errorMessage}
        </p>
      )}
      <div className="flex items-center px-4 border-b border-gray-primary py-2">
        <span className="text-lg mr-6 font-semibold">To:</span>
        <input
          type="text"
          name="reciever"
          className="w-full p-2 px-3 border border-transparent focus:border-gray-base"
          placeholder="Search"
          value={inputValueState}
          onChange={({ target }) => setInputValue(target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleRecieverInsertion();
          }}
        />
        <button
          type="submit"
          onClick={handleOpenNewRoom}
          className={`ml-5 font-semibold p-1 text-blue-medium ${
            !isValid && 'opacity-25 cursor-default'
          }`}
          disabled={!isValid}
        >
          Send
        </button>
      </div>
      <div className="flex flex-col px-4 mt-4 mb-1">
        <p className="mb-3 font-semibold text-lg">Users added</p>
        <ul className="flex flex-wrap">
          {recieverState &&
            recieverState.map((reciever, idx) => (
              <li
                className="p-0.5 px-3 mr-3 mb-4 bg-blue-100 text-blue-500 rounded-md text-lg border border-blue-200"
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
              >
                {reciever}
              </li>
            ))}
        </ul>
      </div>
    </Modal>
  );
}

AddRoom.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};
