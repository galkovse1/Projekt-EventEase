import { ActualFileObject } from 'filepond';
import { Socket } from 'socket.io-client';
import { MultiValue } from 'react-select';

export interface IUser {
  id?: number;
  email: string;
  picUrl?: string;
  publicPic_id?: string;
  username?: string;
  name?: string;
  bio?: string;
  lastName?: string;
}

export interface ServerErrors {
  name: string;
  description: string;
  trace: string;
  status: number;
  code: number;
  error: boolean;
}

export interface IUserContext {
  userInfo: IUserAPI | null;
  setUserInfo: React.Dispatch<IUserAPI>;
}

export interface IEvents {
  id: number;
  createdBy: number;
  location: string;
  eventDate: string;
  eventName: string;
  description: string;
  picUrl: string;
  publicPic_id?: string;
  topic: string;
  members?: Array<IMembersAPI>;
  user: IUserAPI;
}

export interface IEventsData {
  createdBy: string;
  location: string;
  eventDate: string;
  eventName: string;
  description: string;
  eventPic: ActualFileObject;
}

export interface IOptionsForMembers {
  value: string;
  label: string;
}

export interface IUserAPI {
  id: number;
  email: string;
  picUrl: string;
  publicPic_id?: string;
  username?: string;
  name: string;
  bio?: string;
  lastName?: string;
}

export interface IDataMembers {
  members: MultiValue<IOptionsForMembers[]>;
}

export interface ICurrentEventContext {
  eventData: IEvents | null;
  updateCurrentEvent: (event: IEvents) => void;
}

export interface IMembersAPI {
  id: number;
  activeMember: boolean;
  event_id: number;
  user_id: number;
}

export interface IDataItems {
  item_name: string;
  id: number;
}

export interface IListItems {
  id: number;
  event_id: number;
  item_name: string;
}

export interface ISingleEvent {
  id: number;
  location: string;
  eventDate: string;
  eventName: string;
  description: string;
  picUrl: string;
  topic: string;
  createdBy: number;
  members: Array<IMembersAPI>;
  items: Array<IListItems>;
  user: IUserAPI;
}

export interface ICollaboratorsList {
  id: number;
  item_id: number;
  added: boolean;
  member_id: number;
  user: IUserAPI;
}

export interface IEditUser {
  email: string;
  name: string;
  bio: string;
  lastName: string;
  username: string;
  userPic: ActualFileObject | string;
}

export interface ISocket {
  socket: Socket | null;
}

export interface IMessages {
  id: number;
  message: string;
  event_id: number;
  user_id: number;
  roomChatId: string;
  createdAt: string;
  user?: IUserAPI;
}

export interface IErrorSockets {
  message: string;
  error: boolean;
  code: number;
}

export interface ICalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}
