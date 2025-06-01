import { createContext } from 'react';

import { ICurrentEventContext } from '../types/app-types';

export const CurrentEventContext = createContext<ICurrentEventContext | null>(null);
