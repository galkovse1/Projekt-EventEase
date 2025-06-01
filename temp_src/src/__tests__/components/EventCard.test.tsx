import { render, screen } from '@testing-library/react';
import { StaticRouter } from 'react-router-dom/server';

import { EventCard } from '../../components/EventCard/EventCard';
import { eventList } from '../../__mocks__/event-mocks';

describe('Event Card Component tests', () => {
  test('Should render props correctly', () => {
    render(
      <StaticRouter location={'/'}>
        <EventCard event={eventList[0]} />
      </StaticRouter>
    );

    expect(screen.getByText(eventList[0].eventName)).toBeInTheDocument();
    expect(screen.getByText(eventList[0].eventName).textContent).toMatch(eventList[0].eventName);
  });
});
