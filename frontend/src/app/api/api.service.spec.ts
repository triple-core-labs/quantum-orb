import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { ApiService } from "./api.service";
import { environment } from "../../environments/environment";

describe("ApiService", () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("requests the leaderboard without an address", () => {
    service.leaderboard().subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/leaderboard`);
    expect(request.request.method).toBe("GET");
    expect(request.request.params.has("address")).toBeFalse();
    request.flush({ top: [], around: [] });
  });

  it("passes the address as a query parameter", () => {
    service.leaderboard("0xABC").subscribe();
    const request = http.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/leaderboard`,
    );
    expect(request.request.params.get("address")).toBe("0xABC");
    request.flush({ top: [], around: [] });
  });

  it("requests a player's pending orb", () => {
    let received: unknown;
    service.pending("0xabc").subscribe((value) => (received = value));
    const request = http.expectOne(
      `${environment.apiBaseUrl}/players/0xabc/pending`,
    );
    expect(request.request.method).toBe("GET");
    request.flush({ pending: null });
    expect(received).toEqual({ pending: null });
  });

  it("requests a player's referrals", () => {
    let received: unknown;
    service.referrals("0xabc").subscribe((value) => (received = value));
    const request = http.expectOne(
      `${environment.apiBaseUrl}/players/0xabc/referrals`,
    );
    expect(request.request.method).toBe("GET");
    request.flush({ count: 0, referrals: [] });
    expect(received).toEqual({ count: 0, referrals: [] });
  });

  it("surfaces a 404 for an unknown player as an error", (done) => {
    service.player("0xabc").subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
        done();
      },
    });
    http
      .expectOne(`${environment.apiBaseUrl}/players/0xabc`)
      .flush({ detail: "not found" }, { status: 404, statusText: "Not Found" });
  });
});
