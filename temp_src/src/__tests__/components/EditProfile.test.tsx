import { render, screen, waitFor } from '@testing-library/react';
import { StaticRouter } from 'react-router-dom/server';
import userEvent from '@testing-library/user-event';
import nock from 'nock';

import { EditProfile } from '../../components/EditProfile/EditProfile';
import { UserContext } from '../../context/UserContext';
import { mockUser, userInfo, updatedMockUser, mockFileUpload } from '../../__mocks__/user-mocks';
import { env } from '../../helpers/env';

const mockedUsedNavigate = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

/**
 *! Pre-flight request with option method to make put method work
 ** In particular, a request is pre-flighted if:
 *? It uses methods other than GET, HEAD or POST.
 *? Also, if POST is used to send request data with a Content-Type other than:
 *? application/x-www-form-urlencoded, multipart/form-data, or text/plain, e.g.
 *? if the POST request sends an XML payload to the server using application/xml or text/xml, then the request is pre-flighted.
 */

nock(env.baseUrl)
  .defaultReplyHeaders({
    'access-control-allow-origin': '*',
  })
  .options(`/api/users/modify/${mockUser.id}`)
  .reply(200);

nock(env.baseUrl)
  .persist()
  .defaultReplyHeaders({
    'access-control-allow-origin': '*',
  })
  .put(`/api/users/modify/${mockUser.id}`)
  .reply(200, updatedMockUser);

describe('Edit Profile Component tests', () => {
  test('should render form with user information', () => {
    const setUserInfo = jest.fn();

    render(
      <UserContext.Provider value={{ userInfo: mockUser, setUserInfo }}>
        <StaticRouter location={'/edit-profile'}>
          <EditProfile />
        </StaticRouter>
      </UserContext.Provider>
    );

    const inputs = screen.getAllByTestId('inputElement__editProfile');
    const nameInput: HTMLInputElement = screen.getByLabelText('First Name', { selector: 'input' });
    const textArea: HTMLTextAreaElement = screen.getByTestId('textareaElement__editProfile');
    const btn = screen.getByTestId('btnEditProfile');

    expect(inputs.length).toBe(3);
    expect(textArea).toBeInTheDocument();
    expect(nameInput.value).toMatch(mockUser.name);
    expect(btn).toBeInTheDocument();
  });

  test('Should user can update their data', async () => {
    const setUserInfo = jest.fn();

    const { container } = render(
      <UserContext.Provider value={{ userInfo: mockUser, setUserInfo }}>
        <StaticRouter location={'/edit-profile'}>
          <EditProfile />
        </StaticRouter>
      </UserContext.Provider>
    );

    const firstNameInput = screen.getByLabelText('First Name', { selector: 'input' });
    const filePond: HTMLInputElement | null = container.querySelector("input[type='file']");
    const lastNameInput = screen.getByLabelText('Last Name', { selector: 'input' });
    const usernameInput = screen.getByLabelText('Username', { selector: 'input' });
    const bioTextArea = screen.getByLabelText('User Bio', { selector: 'textarea' });
    const updateBtn = screen.getByTestId('btnEditProfile');

    userEvent.type(firstNameInput, userInfo.name);
    userEvent.type(lastNameInput, userInfo.lastName);
    userEvent.type(usernameInput, userInfo.username);
    userEvent.type(bioTextArea, userInfo.bio);
    if (filePond) userEvent.upload(filePond, mockFileUpload);

    userEvent.click(updateBtn);

    await waitFor(() => {
      if (filePond && filePond.files) expect(filePond.files[0]).toStrictEqual(mockFileUpload);
      expect(setUserInfo).toHaveBeenCalledTimes(1);
    });
  });
});
