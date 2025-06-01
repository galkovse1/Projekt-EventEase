import { env } from '../helpers/env';
import {
  IEventsData,
  IEvents,
  IDataMembers,
  IMembersAPI,
  IListItems,
  IUserAPI,
  IDataItems,
} from '../types/app-types';

export const createNewEvent = async (data: IEventsData) => {
  try {
    if (data) {
      const fd = new FormData();
      for (const name in data) {
        fd.append(name, data[name as keyof IEventsData]);
      }

      const response = await fetch(`${env.baseUrl}/api/events`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
        body: fd,
      });

      const result = (await response.json()) as IEvents;
      return result;
    }
  } catch (err) {
    console.error(err);
  }
};

export const addMembersToEvent = async (userId: number, eventId: number, data: IDataMembers) => {
  try {
    if (data.members.length > 0) {
      const res = await fetch(`${env.baseUrl}/api/events/add-member/${userId}/event/${eventId}`, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
        body: JSON.stringify(data),
      });

      const allMembers = (await res.json()) as unknown as IMembersAPI[];
      return allMembers;
    }
  } catch (err) {
    console.error(err);
  }
};

export const addItemsToEvent = async (eventId: number, data: { items: Array<IDataItems> }) => {
  try {
    if (Array.isArray(data.items) && data.items.length > 0) {
      const res = await fetch(`${env.baseUrl}/api/events/add-items/${eventId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
        body: JSON.stringify(data),
      });

      const itemsList = (await res.json()) as unknown as Array<IListItems>;
      return itemsList;
    }
  } catch (err) {
    console.error(err);
  }
};

export const getSingleEventInfo = async (eventId: string) => {
  try {
    if (eventId) {
      const data = await fetch(`${env.baseUrl}/api/events/single-event/${eventId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
      });

      const event = (await data.json()) as unknown as IEvents;
      return event;
    }
  } catch (err) {
    console.error(err);
  }
};

export const retrieveAllListOfEvents = async () => {
  try {
    const dataList = await fetch(`${env.baseUrl}/api/events/all-events`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': `${env.baseUrl}`,
      },
    });

    const eventList = (await dataList.json()) as IEvents[];
    return eventList;
  } catch (err) {
    console.error(err);
  }
};

export const addCollaborator = async (itemId: number, userId: number, eventId: number) => {
  try {
    const data = await fetch(`${env.baseUrl}/api/events/add-item-collaborator/${userId}/item/${itemId}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': `${env.baseUrl}`,
      },
      body: JSON.stringify({ eventId }),
    });

    const user = (await data.json()) as unknown as IUserAPI;
    return user;
  } catch (err) {
    console.error(err);
  }
};

export const getListCollaborators = async (itemId: number) => {
  try {
    if (itemId) {
      const data = await fetch(`${env.baseUrl}/api/events/collaborations/${itemId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
      });

      const listUsers = (await data.json()) as unknown as IUserAPI[];
      return listUsers;
    }
  } catch (err) {
    console.error(err);
  }
};

export const removeCollaboration = async (itemId: number, userId: number) => {
  try {
    if (itemId && userId) {
      const data = await fetch(`${env.baseUrl}/api/events/collaboration/${itemId}/member/${userId}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
      });

      const list = (await data.json()) as unknown as IUserAPI[];
      return list;
    }
  } catch (err) {
    console.error(err);
  }
};

export const retrieveListOfMembers = async (eventId: number) => {
  try {
    if (eventId) {
      const data = await fetch(`${env.baseUrl}/api/events/member-list/${eventId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${env.baseUrl}`,
        },
      });

      const users = (await data.json()) as unknown as IUserAPI[];
      return users;
    }
  } catch (err) {
    console.error(err);
  }
};
