import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaticRouter } from 'react-router-dom/server';
import { useAuth0 } from '@auth0/auth0-react';

import { Login } from '../../components/Login/Login';
import { MockedUserAuth0 } from '../../types/test-types';

jest.mock('@auth0/auth0-react');

describe('Login Process using Auth0', () => {
  test('User should login in or sign up to access the web app', () => {
    const loginWithPopup = jest.fn();
    (useAuth0 as unknown as MockedUserAuth0).mockReturnValue({
      loginWithPopup,
    });

    render(
      <StaticRouter location={'/'}>
        <Login />
      </StaticRouter>
    );

    const img: HTMLImageElement = screen.getByAltText(/Planner APP Background/);
    const loginBtn = screen.getByRole('button', { name: 'Join us' });
    userEvent.click(loginBtn);

    expect(img).toBeInTheDocument();
    expect(img.src).toContain(
      'https://res.cloudinary.com/dukuzakaw/image/upload/v1669417452/plannerApp/loginImage/login_image_tipn8h.webp'
    );
    expect(useAuth0).toHaveBeenCalled();
    expect(loginWithPopup).toHaveBeenCalled();
  });
});
