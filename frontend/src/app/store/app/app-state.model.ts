import { Contract } from 'ethers';
import { User } from '../../interfaces/user';

export interface AppStateModel {
  address: string | null;
  points: number;
  contract: Contract | null;
  users: User[];
}
