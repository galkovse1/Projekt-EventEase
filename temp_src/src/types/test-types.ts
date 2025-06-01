import { User } from '@auth0/auth0-react';

export interface MockedUserAuth0 extends User {
  mockReturnValue: jest.Mock;
}
