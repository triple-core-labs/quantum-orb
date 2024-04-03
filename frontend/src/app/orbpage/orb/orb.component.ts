import { Component, Input, OnInit, computed, inject, signal } from "@angular/core";
import { CountdownComponent, CountdownEvent } from "ngx-countdown";
import { Store } from "@ngxs/store";
import { formatEther } from "ethers";
import { ContractService } from "../../contract/contract.service";
import { WalletService } from "../../wallet/wallet.service";
import { OpenOrb } from "../../store/app/app.actions";
import { ORB_LABELS, ORB_SLUGS, OrbType } from "../../contract/orb-type";

const ONE_DAY_SECONDS = 24 * 60 * 60;

@Component({
  selector: "app-orb",
  standalone: true,
  imports: [CountdownComponent],
  templateUrl: "./orb.component.html",
  styleUrl: "./orb.component.scss",
})
export class OrbComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly contract = inject(ContractService);
  private readonly wallet = inject(WalletService);

  @Input({ required: true }) orbType!: OrbType;
  @Input() priceWei = 0n;

  readonly secondsUntilReady = signal(0);

  readonly label = computed(() => ORB_LABELS[this.orbType]);
  readonly slug = computed(() => ORB_SLUGS[this.orbType]);
  readonly priceLabel = computed(() =>
    this.priceWei > 0n ? formatEther(this.priceWei) : "",
  );

  get locked(): boolean {
    return this.orbType === OrbType.DAILY && this.secondsUntilReady() > 0;
  }

  async ngOnInit(): Promise<void> {
    if (this.orbType !== OrbType.DAILY) return;

    const address = this.wallet.address();
    if (!address) return;

    try {
      const lastOpen = await this.contract.lastDailyOpen(address);
      if (lastOpen === 0) return;

      const readyAt = lastOpen + ONE_DAY_SECONDS;
      const now = Math.floor(Date.now() / 1000);
      this.secondsUntilReady.set(Math.max(0, readyAt - now));
    } catch {
      this.secondsUntilReady.set(0);
    }
  }

  open(): void {
    if (this.locked) return;
    this.store.dispatch(new OpenOrb(this.orbType, this.priceWei));
  }

  onCountdown(event: CountdownEvent): void {
    if (event.action === "done") this.secondsUntilReady.set(0);
  }
}
