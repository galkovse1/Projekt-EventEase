import { render, screen, waitFor } from '@testing-library/react';
import { StaticRouter } from 'react-router-dom/server';
import nock from 'nock';

import { MainPage } from '../../components/MainPage/MainPage';
import { env } from '../../helpers/env';
import { eventList } from '../../__mocks__/event-mocks';

nock(env.baseUrl)
  .persist()
  .defaultReplyHeaders({
    'access-control-allow-origin': '*',
  })
  .get('/api/events/all-events')
  .reply(200, eventList);

describe('Main Page Component tests', () => {
  test('Should render a message on screen when data is not rendered', () => {
    render(
      <StaticRouter location={'/'}>
        <MainPage />
      </StaticRouter>
    );

    const message = screen.getByText(/No events yet/);

    expect(message).toBeInTheDocument();
  });

  test('Should render information of the event', async () => {
    render(
      <StaticRouter location={'/'}>
        <MainPage />
      </StaticRouter>
    );

    await waitFor(() => {
      const events = screen.getAllByTestId('eventCardsArray');

      expect(events.length).toBe(4);
      expect(screen.getByText(eventList[0].eventName)).toBeInTheDocument();
      expect(screen.getByText(eventList[1].eventName)).toBeInTheDocument();
      expect(screen.getByText(eventList[2].eventName)).toBeInTheDocument();
      expect(screen.getByText(eventList[3].eventName)).toBeInTheDocument();
    });
  });
});
