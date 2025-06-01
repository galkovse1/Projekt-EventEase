import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { retrieveAllListOfEvents } from '../../services/fetch-events';
import { errorToast } from '../../helpers/toasts';
import { defaultEndDate } from '../../helpers/app-functions';
import { ICalendarEvent } from '../../types/app-types';

const localizer = momentLocalizer(moment);

export const CalendarProfile = (): JSX.Element => {
  const [events, setEvents] = useState<ICalendarEvent[]>([]);

  const getEvents = async () => {
    const response = await retrieveAllListOfEvents();

    if (response) {
      if ('error' in response) {
        errorToast('Error Uploading user events, Our team will be fixing this!');
        return;
      }

      const updateProp = response.map(event => {
        return {
          title: event.eventName,
          start: new Date(event.eventDate),
          end: defaultEndDate(event.eventDate),
        };
      });

      setEvents(updateProp);
    }
  };

  useEffect(() => {
    void getEvents();
  }, []);

  return (
    <Calendar
      defaultView="month"
      events={events}
      localizer={localizer}
      style={{ marginTop: '2rem', height: '100vh' }}
    />
  );
};
