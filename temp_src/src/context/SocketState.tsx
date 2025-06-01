import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import io, { Socket } from 'socket.io-client';

import { SocketContext } from './SocketContext';
import { env } from '../helpers/env';

export const SocketState = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth0();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && !socket) {
      const socketTemp = io(env.baseUrl, {
        transports: ['websocket'],
      });

      setSocket(socketTemp);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
