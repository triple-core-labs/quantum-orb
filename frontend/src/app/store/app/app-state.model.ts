import { Contract } from 'ethers';
import { User } from '../../interfaces/user';

export interface AppStateModel {
  address: string | null;
  points: number;
  lastOpenedDaily: Date | null;
  contract: Contract | null;
  users: User[];
}
