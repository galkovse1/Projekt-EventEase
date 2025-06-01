/* eslint-disable import/default */
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePond, registerPlugin } from 'react-filepond';
import { FilePondFile } from 'filepond';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import './CreateEvent.css';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import { UserContext } from '../../context/UserContext';
import { CurrentEventContext } from '../../context/CurrentEventContext';
import { createNewEvent } from '../../services/fetch-events';
import { Spinner } from '../Spinner/Spinner';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType);

const initialState = {
  location: '',
  eventDate: new Date().toISOString().slice(0, 16),
  eventName: '',
  description: '',
};

export const CreateEvent = () => {
  const navigate = useNavigate();
  const userCtx = useContext(UserContext);
  const eventCtx = useContext(CurrentEventContext);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [state, setState] = useState(initialState);
  const [picture, setPicture] = useState<FilePondFile[]>([]);
  const [dateError, setDateError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingRequest(true);

    if (userCtx?.userInfo?.id) {
      if (state.eventDate && state.eventName && state.description) {
        const selectedDate = new Date(state.eventDate);
        const now = new Date();
        if (selectedDate <= now) {
          setLoadingRequest(false);
          setDateError('Datum in ura sta napačna!');
          return;
        }
        setDateError('');
        const eventData = {
          eventPic: picture[0]?.file,
          createdBy: String(userCtx.userInfo.id),
          ...state,
        };

        eventData.eventDate = new Date(state.eventDate).toISOString();

        const newEvent = await createNewEvent(eventData);
        setState(initialState);
        setPicture([]);

        if (newEvent?.id) {
          setLoadingRequest(false);
          if (eventCtx) eventCtx.updateCurrentEvent(newEvent);
          navigate('/');
        } else {
          setLoadingRequest(false);
          // Če pride do napake, lahko prikažeš še splošno napako
          navigate('/');
        }
      }
    }

    setLoadingRequest(false);
  };

  if (loadingRequest) {
    return (
      <div className="containerSpinner">
        <div className="loadingContainer">
          <Spinner />
          <h1 className="text-2xl font-semibold mt-4">Creating event, please wait...</h1>
        </div>
      </div>
    );
  }

  return (
    <section className="createEventContainer">
      <h1 className="createEventTitle">Create a New Event</h1>
      <div className="createEventCard">
        <form className="formContainer__createEvent" onSubmit={e => void submitHandler(e)}>
          <div className="formControl__createEvent">
            <FilePond
              allowReorder={true}
              allowMultiple={false}
              onupdatefiles={setPicture}
              allowFileTypeValidation={true}
              acceptedFileTypes={['image/*']}
            />
          </div>
          <div className="formControl__createEvent">
            <input
              className="formInput__event focus:ring-0"
              type="text"
              id="locationInput"
              name="location"
              placeholder=" "
              value={state.location}
              onChange={handleChange}
            />
            <label className="formControl__labelEvent" htmlFor="locationInput">
              Location
            </label>
          </div>
          <div className="formControl__createEvent">
            <input
              className="formInput__event focus:ring-0"
              type="text"
              id="eventName"
              placeholder=" "
              name="eventName"
              value={state.eventName}
              onChange={handleChange}
            />
            <label className="formControl__labelEvent" htmlFor="eventName">
              Event Name
            </label>
          </div>
          <div className="formControl__createEvent">
            <textarea
              className="formInput__event noResizeTextArea focus:ring-0"
              name="description"
              value={state.description}
              onChange={handleChange}
              id="eventDescription"
              placeholder=" "
            ></textarea>
            <label htmlFor="eventDescription" className="formControl__labelEvent">
              Event Description
            </label>
          </div>
          <div className="formControl__createEvent">
            <input
              className="formInput__event focus:ring-0"
              min={new Date().toISOString().slice(0, 16)}
              name="eventDate"
              value={state.eventDate}
              onChange={handleChange}
              type="datetime-local"
              id="eventDescription"
              placeholder=" "
            />
            <label htmlFor="eventDescription" className="formControl__labelEvent">
              Date of the Event
            </label>
            {dateError && <div className="formError">{dateError}</div>}
          </div>
          <div className="formContainer__btn">
            <button type="submit" className="submitButton__newEvent">
              Create event
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
