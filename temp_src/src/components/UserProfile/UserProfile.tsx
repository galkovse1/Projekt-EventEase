import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';

import './UserProfile.css';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { UserContext } from '../../context/UserContext';
import { CalendarProfile } from '../CalendarProfile/CalendarProfile';
import { env } from '../../helpers/env';

export const UserProfile = (): JSX.Element | null => {
  const userCtx = useContext(UserContext);

  if (!userCtx?.userInfo) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-details-container">
        <div className="image-username">
          <LazyLoadImage
            loading="lazy"
            effect="blur"
            alt={userCtx.userInfo.name}
            src={userCtx.userInfo.picUrl}
            className="profile__image"
            height={325}
            width={325}
            placeholderSrc={env.userImgPlaceholder}
          />
          <h2 className="profile__username">{userCtx.userInfo.username}</h2>
        </div>
        <div className="profile-text-container">
          <h2 className="profile-text-headings">First Name</h2>
          <div className="profile-text-style">
            <h2 className="profile-line">{userCtx.userInfo.name}</h2>
          </div>
          <h2 className="profile-text-headings">Last Name</h2>
          <div className="profile-text-style">
            <p className="profile-line">{userCtx.userInfo.lastName}</p>
          </div>
          <h2 className="profile-text-headings">Email</h2>
          <div className="profile-text-style">
            <p className="profile-line">{userCtx.userInfo.email}</p>
          </div>
          <h2 className="profile-text-headings">Bio</h2>
          <div className="profile-text-style bio">
            <p className="profile-line">{userCtx.userInfo.bio}</p>
          </div>
          <div className="btn-container">
            <Link to="/edit-profile">
              <Button className="edit-btn" variant="contained" startIcon={<EditIcon />}>
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <CalendarProfile />
    </div>
  );
};
