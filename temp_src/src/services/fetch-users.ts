import { env } from '../helpers/env';
import { IUser, ServerErrors, IUserAPI, IEditUser } from '../types/app-types';

export const createNewUser = async (data: IUser) => {
  try {
    const result = await fetch(`${env.baseUrl}/api/users`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': `${env.baseUrl}`,
      },
      body: JSON.stringify(data),
    });

    const newUser = (await result.json()) as unknown as IUserAPI | ServerErrors;

    return newUser;
  } catch (err) {
    console.error(err);
  }
};

export const retrieveMembersList = async (userId: number) => {
  try {
    if (userId) {
      const list = await fetch(`${env.baseUrl}/api/users/all-users/${userId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
      });

      const result = (await list.json()) as IUserAPI[];

      return result;
    }
  } catch (err) {
    console.error(err);
  }
};

export const getSingleUserInfo = async (userId: number) => {
  try {
    if (!isNaN(userId)) {
      const userInfo = await fetch(`${env.baseUrl}/api/users/get/${userId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
      });

      const user = (await userInfo.json()) as unknown as IUserAPI;
      return user;
    }
  } catch (err) {
    console.error(err);
  }
};

export const modifyUser = async (id: number, data: IEditUser) => {
  try {
    if (!id) return;

    if (data) {
      const formData = new FormData();
      for (const name in data) {
        formData.append(name, data[name as keyof IEditUser]);
      }

      const result = await fetch(`${env.baseUrl}/api/users/modify/${id}`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
        body: formData,
      });

      const modifiedUser = (await result.json()) as IUserAPI;

      return modifiedUser;
    }
  } catch (err) {
    console.error(err);
  }
};
