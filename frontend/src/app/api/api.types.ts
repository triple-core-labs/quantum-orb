export interface LeaderboardRow {
  address: string;
  points: number;
  referral_points: number;
  rank: number;
}

export interface LeaderboardResponse {
  top: LeaderboardRow[];
  around: LeaderboardRow[];
}

export interface PlayerDetail {
  address: string;
  points: number;
  referralPoints: number;
  rank: number | null;
  isPartner: boolean;
  referrer: string | null;
  referralCount: number;
}

export interface Referral {
  address: string;
  points: number;
  earned: number;
}

export interface ReferralsResponse {
  count: number;
  referrals: Referral[];
}

export interface PendingOrb {
  orbType: number;
  commitBlock: number;
}

export interface PendingResponse {
  pending: PendingOrb | null;
}

export interface OrbPrice {
  price: string;
  enabled: boolean;
}

export interface ChainConfig {
  chainId: number;
  contractAddress: string;
  rpcUrl: string;
  confirmations: number;
  orbs?: Record<string, OrbPrice>;
  revealDelay?: number;
  revealWindow?: number;
}
