import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import { UserContext } from './UserContext';
import { IUserAPI } from '../types/app-types';
import { createNewUser } from '../services/fetch-users';

export const UserState = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuth0();
  const [userInfo, setUserInfo] = useState<IUserAPI | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userData = {
        email: user.email ? user.email : 'Invalid Email',
        username: user.nickname,
        picUrl: user.picture,
        name: user.nickname,
      };

      void createNewUser(userData).then(newUser => {
        if (newUser) {
          if ('email' in newUser) setUserInfo(newUser);
          else console.log(newUser.description);
        }
      });
    }
  }, [isAuthenticated, user]);

  return <UserContext.Provider value={{ userInfo, setUserInfo }}>{children}</UserContext.Provider>;
};
