import { Injectable } from "@angular/core";

export const STORAGE_KEY = "quantum-orb.referrer";

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;

@Injectable({ providedIn: "root" })
export class ReferralLinkService {
  capture(params: Record<string, string | undefined>): void {
    const candidate = params["ref"];
    if (!candidate || !ADDRESS.test(candidate)) return;
    if (this.stored()) return;

    try {
      localStorage.setItem(STORAGE_KEY, candidate.toLowerCase());
    } catch {
      return;
    }
  }

  stored(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  linkFor(address: string): string {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/?ref=${address}`;
  }
}
