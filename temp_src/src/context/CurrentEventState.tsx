import { useState, useContext } from 'react';

import { CurrentEventContext } from './CurrentEventContext';
import { SocketContext } from './SocketContext';
import { IEvents } from '../types/app-types';

export const CurrentEventState = ({ children }: { children: JSX.Element }) => {
  const [eventData, setEventData] = useState<IEvents | null>(null);
  const socketCtx = useContext(SocketContext);

  const updateCurrentEvent = (data: IEvents) => {
    if (eventData && socketCtx && socketCtx.socket) {
      socketCtx.socket.emit('client:leave-room', `${eventData.eventName}-${eventData.id}`);
    }

    if (data) setEventData(data);
  };

  return (
    <CurrentEventContext.Provider value={{ eventData, updateCurrentEvent }}>{children}</CurrentEventContext.Provider>
  );
};
