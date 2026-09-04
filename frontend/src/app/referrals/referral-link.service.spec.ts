import { TestBed } from "@angular/core/testing";
import { ReferralLinkService, STORAGE_KEY } from "./referral-link.service";

describe("ReferralLinkService", () => {
  let service: ReferralLinkService;
  const VALID = "0x" + "a".repeat(40);

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferralLinkService);
  });

  afterEach(() => localStorage.removeItem(STORAGE_KEY));

  it("stores a valid referrer from the query string", () => {
    service.capture({ ref: VALID });
    expect(service.stored()).toBe(VALID.toLowerCase());
  });

  it("ignores a malformed referrer", () => {
    service.capture({ ref: "not-an-address" });
    expect(service.stored()).toBeNull();
  });

  it("keeps the first referrer seen", () => {
    service.capture({ ref: VALID });
    service.capture({ ref: "0x" + "b".repeat(40) });
    expect(service.stored()).toBe(VALID.toLowerCase());
  });

  it("builds an invite link for an address", () => {
    expect(service.linkFor(VALID)).toContain(`?ref=${VALID}`);
  });

  it("survives storage being unavailable", () => {
    spyOn(localStorage, "setItem").and.throwError("blocked");
    expect(() => service.capture({ ref: VALID })).not.toThrow();
  });
});
