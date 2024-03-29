import { OrbType } from "../../contract/orb-type";

export type OrbStatus =
  | { kind: "idle" }
  | { kind: "awaiting_signature"; orbType: OrbType }
  | { kind: "committed"; orbType: OrbType; commitBlock: number }
  | { kind: "revealing"; orbType: OrbType }
  | { kind: "revealed"; orbType: OrbType; rank: number; points: number }
  | { kind: "expired"; orbType: OrbType }
  | { kind: "error"; message: string };
