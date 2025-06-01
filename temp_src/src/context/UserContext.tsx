import { createContext } from 'react';

import { IUserContext } from '../types/app-types';

export const UserContext = createContext<IUserContext | null>(null);
