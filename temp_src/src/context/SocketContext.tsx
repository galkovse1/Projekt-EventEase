import { createContext } from 'react';

import { ISocket } from '../types/app-types';

export const SocketContext = createContext<ISocket | null>(null);
