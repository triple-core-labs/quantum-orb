import { LeaderboardRow, Referral } from "../../api/api.types";
import { OrbStatus } from "../orb/orb-status";

export interface AppStateModel {
  address: string | null;
  orbStatus: OrbStatus;
  leaderboard: LeaderboardRow[];
  around: LeaderboardRow[];
  referrals: Referral[];
  referralCount: number;
  points: number;
}
