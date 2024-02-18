import { Contract, ethers } from 'ethers';
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

export class OpenDailyOrb {
  static readonly type = '[App] Open Daily Orb';

  constructor(public signer: ethers.providers.JsonRpcSigner) {}
}

export class OpenGenesisOrb {
  static readonly type = '[App] Open Genesis Orb';
}

export class OpenQuantumOrb {
  static readonly type = '[App] Open Quantum Orb';
}

export class GetLastOpenedDaily {
  static readonly type = '[App] Get Last Opened Daily Timestamp';
}
