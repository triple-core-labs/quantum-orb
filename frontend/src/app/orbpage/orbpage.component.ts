import { Component, OnInit, inject, signal } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Store } from "@ngxs/store";
import { toSignal } from "@angular/core/rxjs-interop";
import { OrbComponent } from "./orb/orb.component";
import { UnboxingDialogComponent } from "./unboxing-dialog/unboxing-dialog.component";
import { ApiService } from "../api/api.service";
import { AppSelectors } from "../store/app/app.selectors";
import { ORB_LABELS, OrbType, rarityOf } from "../contract/orb-type";
import { OrbOpenRow, PlayerDetail } from "../api/api.types";
import { ReclaimOrb } from "../store/app/app.actions";

@Component({
  selector: "app-orbpage",
  standalone: true,
  imports: [OrbComponent, MatDialogModule],
  templateUrl: "./orbpage.component.html",
  styleUrl: "./orbpage.component.scss",
})
export class OrbpageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);

  readonly orbTypes = [OrbType.DAILY, OrbType.GENESIS, OrbType.QUANTUM];
  readonly prices = signal<Record<number, bigint>>({
    [OrbType.DAILY]: 0n,
    [OrbType.GENESIS]: 0n,
    [OrbType.QUANTUM]: 0n,
  });

  readonly status = toSignal(this.store.select(AppSelectors.orbStatus));
  readonly address = toSignal(this.store.select(AppSelectors.address), {
    initialValue: null,
  });

  readonly history = signal<OrbOpenRow[]>([]);
  readonly profile = signal<PlayerDetail | null>(null);
  private dialogOpen = false;

  constructor() {
    this.store.select(AppSelectors.orbStatus).subscribe((status) => {
      const active = status.kind !== "idle";
      if (active && !this.dialogOpen) {
        this.dialogOpen = true;
        this.dialog
          .open(UnboxingDialogComponent, {
            disableClose: true,
            panelClass: "orb-dialog",
          })
          .afterClosed()
          .subscribe(() => (this.dialogOpen = false));
      }
      if (!active && this.dialogOpen) this.dialog.closeAll();
    });
  }

  ngOnInit(): void {
    const address = this.address();
    if (address) {
      this.api.opens(address).subscribe(({ opens }) => this.history.set(opens));
      this.api.player(address).subscribe({
        next: (profile) => this.profile.set(profile),
        error: () => this.profile.set(null),
      });
    }

    this.api.config().subscribe((config) => {
      if (!config.orbs) return;
      const next: Record<number, bigint> = { ...this.prices() };
      for (const [key, value] of Object.entries(config.orbs)) {
        next[Number(key)] = BigInt(value.price);
      }
      this.prices.set(next);
    });
  }

  priceFor(orbType: OrbType): bigint {
    return this.prices()[orbType] ?? 0n;
  }

  orbLabel(orbType: number): string {
    return ORB_LABELS[orbType as OrbType] ?? "Orb";
  }

  rarityName(rank: number): string {
    return rarityOf(rank).name;
  }

  raritySlug(rank: number): string {
    return rarityOf(rank).slug;
  }

  reclaim(): void {
    this.store.dispatch(new ReclaimOrb());
  }
}
