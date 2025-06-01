import { useState, useEffect } from 'react';

import './MainPage.css';

import { retrieveAllListOfEvents } from '../../services/fetch-events';
import { EventCard } from '../EventCard/EventCard';
import { IEvents } from '../../types/app-types';

export const MainPage = () => {
  const [eventList, setEventList] = useState<Array<IEvents>>([]);

  useEffect(() => {
    void retrieveAllListOfEvents().then(list => {
      if (Array.isArray(list) && list.length > 0) {
        setEventList(list);
      }
    });
  }, []);

  if (!Array.isArray(eventList) || eventList.length < 1) {
    return (
      <div className="noEventContainer">
        <h1 className="text-2xl font-semibold text-gray-400">No events yet</h1>
      </div>
    );
  }

  return (
    <div className="mainPage__container">
      {eventList.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
