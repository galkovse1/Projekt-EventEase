import { render, screen, fireEvent } from '@testing-library/react';
import { create } from 'react-test-renderer';
import { StaticRouter } from 'react-router-dom/server';
import { useAuth0 } from '@auth0/auth0-react';

import { NavBar } from '../../components/NavBar/NavBar';
import { MockedUserAuth0 } from '../../types/test-types';

jest.mock('@auth0/auth0-react');

describe('NavBar Component tests', () => {
  test('Component should render information', () => {
    const logout = jest.fn();
    (useAuth0 as unknown as MockedUserAuth0).mockReturnValue({
      logout,
    });

    const treeNavBar = create(
      <StaticRouter location={'/'}>
        <NavBar />
      </StaticRouter>
    ).toJSON();

    expect(treeNavBar).toMatchSnapshot();
  });

  test('Logout Process using Auth0', () => {
    const logout = jest.fn();
    (useAuth0 as unknown as MockedUserAuth0).mockReturnValue({
      logout,
    });

    render(
      <StaticRouter location={'/'}>
        <NavBar />
      </StaticRouter>
    );

    const logoutBtn = screen.getByTestId('logoutButton');
    fireEvent.click(logoutBtn);

    expect(useAuth0).toHaveBeenCalled();
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
