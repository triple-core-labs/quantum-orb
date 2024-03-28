import { Injectable, inject, signal } from "@angular/core";
import { Contract, Interface, TransactionReceipt, ZeroAddress } from "ethers";
import { firstValueFrom } from "rxjs";
import { ApiService } from "../api/api.service";
import { WalletService } from "../wallet/wallet.service";
import abi from "./quantum-orb.abi.json";
import { OrbType } from "./orb-type";

export interface OrbOutcome {
  rank: number;
  points: number;
}

@Injectable({ providedIn: "root" })
export class ContractService {
  private readonly wallet = inject(WalletService);
  private readonly api = inject(ApiService);
  private readonly iface = new Interface(abi as never);

  readonly address = signal<string | null>(null);

  async contract(): Promise<Contract> {
    const signer = await this.wallet.getSigner();
    const address = this.address() ?? (await this.loadAddress());
    return new Contract(address, abi as never, signer);
  }

  async openOrb(
    orbType: OrbType,
    referrer: string | null,
    priceWei: bigint,
  ): Promise<TransactionReceipt> {
    const contract = await this.contract();
    const tx = await contract["openOrb"](orbType, referrer ?? ZeroAddress, {
      value: priceWei,
    });
    return tx.wait();
  }

  async lastDailyOpen(address: string): Promise<number> {
    const contract = await this.contract();
    const user = await contract["users"](address);
    return Number(user.lastDailyOpen);
  }

  async reclaimOrb(): Promise<TransactionReceipt> {
    const contract = await this.contract();
    const tx = await contract["reclaimOrb"]();
    return tx.wait();
  }

  pointsFromReceipt(receipt: TransactionReceipt): OrbOutcome | null {
    for (const log of receipt.logs ?? []) {
      const parsed = this.tryParse(log);
      if (parsed?.name === "OrbOpened") {
        return {
          rank: Number(parsed.args["rank"]),
          points: Number(parsed.args["points"]),
        };
      }
    }
    return null;
  }

  private tryParse(log: { topics: readonly string[]; data: string }) {
    try {
      return this.iface.parseLog({ topics: [...log.topics], data: log.data });
    } catch {
      return null;
    }
  }

  private async loadAddress(): Promise<string> {
    const config = await firstValueFrom(this.api.config());
    this.address.set(config.contractAddress);
    return config.contractAddress;
  }
}
