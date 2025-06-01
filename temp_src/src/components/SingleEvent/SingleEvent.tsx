import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './SingleEvent.css';
import { CurrentEventContext } from '../../context/CurrentEventContext';
import { getSingleEventInfo } from '../../services/fetch-events';
import { IEvents } from '../../types/app-types';
import { Watch } from '../Watch/Watch';

export const SingleEvent = (): JSX.Element => {
  const { eventId } = useParams();
  const eventCtx = useContext(CurrentEventContext);
  const [event, setEvent] = useState<IEvents | null>(null);

  useEffect(() => {
    if (eventId) {
      void getSingleEventInfo(eventId).then(data => {
        if (data && data.id) {
          eventCtx?.updateCurrentEvent(data);
          setEvent(data);
        }
      });
    }
  }, [eventId]);

  if (!event) {
    return (
      <div>
        <h1>Event does not exist</h1>
      </div>
    );
  }

  return (
    <section>
      <div className="singleEvent__banner" style={{ backgroundImage: `url(${event.picUrl})` }}>
        <div className="singleEvent__overlay">
          <h1 className="singleEvent__mainTitle">{event.eventName}</h1>
          <div className="singleEvent__info">
            <div className="singleEvent__timerContainer">
              <p>Location: {event.location}</p>
              <Watch time={event.eventDate} />
            </div>
          </div>
        </div>
        <div className="singleEvent__details">
          <h2>Details</h2>
          <p>{event.description}</p>
        </div>
      </div>
    </section>
  );
};
