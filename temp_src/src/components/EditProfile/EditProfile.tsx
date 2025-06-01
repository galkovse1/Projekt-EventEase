/* eslint-disable import/default */
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePond, registerPlugin } from 'react-filepond';
import { FilePondFile } from 'filepond';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import './EditProfile.css';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import { UserContext } from '../../context/UserContext';
import { modifyUser } from '../../services/fetch-users';
import { Spinner } from '../Spinner/Spinner';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType);

const initialState = {
  email: '',
  name: '',
  bio: '',
  lastName: '',
  username: '',
};

export const EditProfile = () => {
  const navigate = useNavigate();
  const userCtx = useContext(UserContext);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [state, setState] = useState(initialState);
  const [picture, setPicture] = useState<FilePondFile[]>([]);

  useEffect(() => {
    if (!userCtx?.userInfo) {
      navigate('/profile');
    } else {
      setState({
        name: userCtx.userInfo.name,
        email: userCtx.userInfo.email,
        bio: userCtx.userInfo.bio ? userCtx.userInfo?.bio : '',
        lastName: userCtx.userInfo.lastName ? userCtx.userInfo.lastName : '',
        username: userCtx.userInfo.username ? userCtx.userInfo.username : '',
      });
    }
  }, [navigate, userCtx]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingRequest(true);

    const userUpdate = {
      ...state,
      userPic: picture.length ? picture[0].file : '',
    };

    if (userCtx?.userInfo) {
      const newUserProfile = await modifyUser(userCtx.userInfo.id, userUpdate);
      setState(initialState);
      setPicture([]);

      if (newUserProfile?.id) {
        setLoadingRequest(false);
        userCtx?.setUserInfo(newUserProfile);
        navigate('/profile');
      } else {
        setLoadingRequest(false);
        alert('Possible Error');
        navigate('/');
      }
    }
  };

  if (loadingRequest) {
    return (
      <div className="containerSpinner">
        <div className="loadingContainer">
          <Spinner />
          <h1 className="text-2xl font-semibold mt-4">Updating user, please wait...</h1>
        </div>
      </div>
    );
  }

  return (
    <section className="createEventContainer">
      <h1 className="createEventTitle">Edit Your Profile</h1>
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
              data-testid="inputElement__editProfile"
              className="formInput__event focus:ring-0"
              type="text"
              id="firstNameInput"
              name="name"
              placeholder=" "
              value={state.name}
              onChange={handleChange}
            />
            <label className="formControl__labelEvent" htmlFor="firstNameInput">
              First Name
            </label>
          </div>
          <div className="formControl__createEvent">
            <input
              data-testid="inputElement__editProfile"
              className="formInput__event focus:ring-0"
              type="text"
              id="lastNameInput"
              placeholder=" "
              name="lastName"
              value={state.lastName}
              onChange={handleChange}
            />
            <label className="formControl__labelEvent" htmlFor="lastNameInput">
              Last Name
            </label>
          </div>

          <div className="formControl__createEvent">
            <input
              data-testid="inputElement__editProfile"
              className="formInput__event focus:ring-0"
              type="text"
              id="profileUsername"
              placeholder=" "
              name="username"
              value={state.username}
              onChange={handleChange}
            />
            <label className="formControl__labelEvent" htmlFor="profileUsername">
              Username
            </label>
          </div>
          <div className="formControl__createEvent">
            <textarea
              data-testid="textareaElement__editProfile"
              className="formInput__event noResizeTextArea focus:ring-0"
              name="bio"
              value={state.bio}
              onChange={handleChange}
              id="profileDescription"
              placeholder=" "
            ></textarea>
            <label htmlFor="profileDescription" className="formControl__labelEvent">
              User Bio
            </label>
          </div>
          <div className="formContainer__btn">
            <button type="submit" data-testid="btnEditProfile" className="submitButton__newEvent">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
