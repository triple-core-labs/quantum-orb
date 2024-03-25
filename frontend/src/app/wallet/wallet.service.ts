import { Injectable, signal } from "@angular/core";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { environment } from "../../environments/environment";

declare global {
  interface Window {
    ethereum?: {
      request(args: { method: string; params?: unknown[] }): Promise<unknown>;
      on?(event: string, handler: (...args: unknown[]) => void): void;
    };
  }
}

export class WalletUnavailableError extends Error {
  constructor() {
    super("No Ethereum wallet found in this browser");
  }
}

@Injectable({ providedIn: "root" })
export class WalletService {
  readonly address = signal<string | null>(null);

  private provider: BrowserProvider | null = null;

  get available(): boolean {
    return typeof window !== "undefined" && !!window.ethereum;
  }

  get hexChainId(): string {
    return "0x" + environment.chainId.toString(16);
  }

  async restore(): Promise<void> {
    if (!this.available) return;

    window.ethereum!.on?.("chainChanged", () => window.location.reload());
    window.ethereum!.on?.("accountsChanged", (...args: unknown[]) => {
      const accounts = (args[0] as string[]) ?? [];
      this.address.set(accounts[0] ?? null);
    });

    const accounts = (await window.ethereum!.request({
      method: "eth_accounts",
    })) as string[];
    this.address.set(accounts[0] ?? null);
  }

  async connect(): Promise<string | null> {
    if (!this.available) throw new WalletUnavailableError();

    const accounts = (await window.ethereum!.request({
      method: "eth_requestAccounts",
    })) as string[];
    this.address.set(accounts[0] ?? null);
    await this.ensureChain();
    return this.address();
  }

  async ensureChain(): Promise<void> {
    if (!this.available) throw new WalletUnavailableError();

    try {
      await window.ethereum!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: this.hexChainId }],
      });
    } catch (error) {
      if ((error as { code?: number }).code !== 4902) throw error;
      await this.addChain();
    }
  }

  async getSigner(): Promise<JsonRpcSigner> {
    if (!this.available) throw new WalletUnavailableError();
    this.provider ??= new BrowserProvider(window.ethereum as never);
    return this.provider.getSigner();
  }

  private async addChain(): Promise<void> {
    await window.ethereum!.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: this.hexChainId,
          chainName: environment.chainName,
          rpcUrls: [environment.rpcUrl],
          blockExplorerUrls: environment.blockExplorerUrl
            ? [environment.blockExplorerUrl]
            : [],
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        },
      ],
    });
    await this.ensureChain();
  }
}
