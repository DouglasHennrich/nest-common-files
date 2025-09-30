import { TCurrentUser } from '../guard/jwt-authenticate.guard';

export interface ILogin {
  accessToken: string;
  users: TCurrentUser[];
}
