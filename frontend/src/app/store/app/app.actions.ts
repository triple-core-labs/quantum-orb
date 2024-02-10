import { User } from '../../interfaces/user';

export class FetchUsers {
  static readonly type = '[App] Fetch Users';
}

// will be deleted once users can be fetched
export class SetUsers {
  static readonly type = '[App] Set Users';

  constructor(public users: User[]) {}
}

export class SetAddress {
  static readonly type = '[App] Set Address';

  constructor(public address: string) {}
}
// will be deleted once users can be fetched
