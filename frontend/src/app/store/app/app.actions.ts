import { OrbType } from "../../contract/orb-type";

export class Connect {
  static readonly type = "[App] Connect";
}

export class RestoreSession {
  static readonly type = "[App] Restore Session";
  constructor(public address: string) {}
}

export class OpenOrb {
  static readonly type = "[App] Open Orb";
  constructor(
    public orbType: OrbType,
    public priceWei: bigint,
  ) {}
}

export class ReclaimOrb {
  static readonly type = "[App] Reclaim Orb";
}

export class LoadLeaderboard {
  static readonly type = "[App] Load Leaderboard";
}

export class LoadReferrals {
  static readonly type = "[App] Load Referrals";
}

export class DismissOutcome {
  static readonly type = "[App] Dismiss Outcome";
}
