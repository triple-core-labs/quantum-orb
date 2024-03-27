import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import {
  ChainConfig,
  LeaderboardResponse,
  PendingResponse,
  PlayerDetail,
  ReferralsResponse,
} from "./api.types";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  config(): Observable<ChainConfig> {
    return this.http.get<ChainConfig>(`${this.base}/config`);
  }

  leaderboard(address?: string): Observable<LeaderboardResponse> {
    const params = address
      ? new HttpParams().set("address", address)
      : undefined;
    return this.http.get<LeaderboardResponse>(`${this.base}/leaderboard`, {
      params,
    });
  }

  player(address: string): Observable<PlayerDetail> {
    return this.http.get<PlayerDetail>(`${this.base}/players/${address}`);
  }

  referrals(address: string): Observable<ReferralsResponse> {
    return this.http.get<ReferralsResponse>(
      `${this.base}/players/${address}/referrals`,
    );
  }

  pending(address: string): Observable<PendingResponse> {
    return this.http.get<PendingResponse>(
      `${this.base}/players/${address}/pending`,
    );
  }
}
