import { useState, useEffect } from 'react';

import { retrieveMembersList } from '../services/fetch-users';
import { IOptionsForMembers } from '../types/app-types';

type Status = 'unloaded' | 'loading' | 'loaded';

export const useUserList = (userId: number) => {
  const [userList, setUserList] = useState<Array<IOptionsForMembers>>([]);
  const [status, setStatus] = useState<Status>('unloaded');

  useEffect(() => {
    if (!userId) setUserList([]);
    else void requestUserList(userId);
  }, [userId]);

  const requestUserList = async (id: number) => {
    setUserList([]);
    setStatus('loading');

    const list = await retrieveMembersList(id);

    if (list && list.length > 0) {
      const options = list.map(user => ({ value: String(user.id), label: user.name }));
      setUserList(options);
      setStatus('loaded');
      return;
    }

    setStatus('unloaded');
    setUserList([]);
  };

  return [userList, status] as [Array<IOptionsForMembers>, Status];
};
