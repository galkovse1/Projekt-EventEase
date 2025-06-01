import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import './EventCard.css';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { env } from '../../helpers/env';
import { fullTimeDate, getHourDate, relativeTime } from '../../helpers/app-functions';
import { IEvents } from '../../types/app-types';

interface IProps {
  event: IEvents;
}

export const EventCard = ({ event }: IProps) => {
  return (
    <div className="eventCard__container" data-testid="eventCardsArray">
      <Link to={`/single-event/${event.id}`}>
        <div className="eventCard__bodyInfo">
          <LazyLoadImage
            loading="lazy"
            effect="blur"
            alt={event.eventName}
            src={event.picUrl}
            height={192}
            width={240}
            className="eventCard__image"
            placeholderSrc={env.eventImgPlaceholder}
          />
          <div className="eventCard__textContainer">
            <h2 className="eventCardText__title">{event.eventName}</h2>
            <p className="eventCardText__date">{fullTimeDate(event.eventDate)}</p>
            <p className="eventCardText__time">{getHourDate(event.eventDate)}</p>
            <p className="eventCardText__countdown">Starts {relativeTime(event.eventDate)}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};
