import { TestBed } from "@angular/core/testing";
import { WalletService } from "./wallet.service";

describe("WalletService", () => {
  let requests: { method: string; params?: unknown[] }[];

  function installProvider(overrides: Record<string, unknown> = {}) {
    requests = [];
    (window as any).ethereum = {
      request: (args: any) => {
        requests.push(args);
        if (args.method === "eth_accounts") return Promise.resolve([]);
        if (args.method === "eth_requestAccounts") {
          return Promise.resolve(["0xabc"]);
        }
        return Promise.resolve(null);
      },
      on: () => undefined,
      ...overrides,
    };
  }

  beforeEach(() => TestBed.configureTestingModule({}));

  afterEach(() => {
    delete (window as any).ethereum;
  });

  it("reports no wallet when the page has no provider", () => {
    delete (window as any).ethereum;
    expect(TestBed.inject(WalletService).available()).toBeFalse();
  });

  it("does not throw when constructed without a provider", () => {
    delete (window as any).ethereum;
    expect(() => TestBed.inject(WalletService)).not.toThrow();
  });

  it("reports a wallet when a provider is present", () => {
    installProvider();
    expect(TestBed.inject(WalletService).available()).toBeTrue();
  });

  it("connect resolves to the selected account", async () => {
    installProvider();
    await expectAsync(TestBed.inject(WalletService).connect()).toBeResolvedTo(
      "0xabc",
    );
  });

  it("connect rejects without a provider", async () => {
    delete (window as any).ethereum;
    await expectAsync(TestBed.inject(WalletService).connect()).toBeRejected();
  });

  it("restore leaves the address null without a provider", async () => {
    delete (window as any).ethereum;
    const service = TestBed.inject(WalletService);
    await service.restore();
    expect(service.address()).toBeNull();
  });

  it("switches chain using a hex chain id", async () => {
    installProvider();
    await TestBed.inject(WalletService).ensureChain();

    const call = requests.find((r) => r.method === "wallet_switchEthereumChain");
    expect((call!.params![0] as any).chainId).toMatch(/^0x[0-9a-f]+$/);
  });

  it("adds the chain with a hex chain id when it is unknown", async () => {
    installProvider({
      request: (args: any) => {
        requests.push(args);
        if (args.method === "wallet_switchEthereumChain" && requests.length === 1) {
          return Promise.reject({ code: 4902 });
        }
        return Promise.resolve(null);
      },
    });
    await TestBed.inject(WalletService).ensureChain();

    const add = requests.find((r) => r.method === "wallet_addEthereumChain");
    expect(typeof (add!.params![0] as any).chainId).toBe("string");
  });
});
