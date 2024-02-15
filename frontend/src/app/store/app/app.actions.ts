import { Contract } from 'ethers';
import { User } from '../../interfaces/user';

export class FetchUsers {
  static readonly type = '[App] Fetch Users';
}
export class SetUsers {
  static readonly type = '[App] Set Users';

  constructor(public users: User[]) {}
}

export class SetAddress {
  static readonly type = '[App] Set Address';

  constructor(public address: string) {}
}

export class SetContract {
  static readonly type = '[App] Set Contract';

  constructor(public contract: Contract) {}
}

export class GetPoints {
  static readonly type = '[App] Get Points';
}
