import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ApiService } from "../api/api.service";
import { ChainConfig, OrbOpenRow } from "../api/api.types";
import { ORB_LABELS, OrbType, rarityOf } from "../contract/orb-type";
import { ShortAddressPipe } from "../pipes/short-address.pipe";

const RANK_LABELS = [1, 2, 3, 4];

@Component({
  selector: "app-fairness",
  standalone: true,
  imports: [ShortAddressPipe],
  templateUrl: "./fairness.component.html",
  styleUrl: "./fairness.component.scss",
})
export class FairnessComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly config = signal<ChainConfig | null>(null);
  readonly recent = signal<OrbOpenRow[]>([]);

  readonly odds = computed(() => {
    const config = this.config();
    if (!config?.rankBands) return [];

    const { rank4, rank3, rank2 } = config.rankBands;
    const space = config.rollSpace ?? 10000;
    const counts = [space - rank2, rank2 - rank3, rank3 - rank4, rank4];

    return RANK_LABELS.map((rank, index) => ({
      rank,
      rarity: rarityOf(rank),
      percent: ((counts[index] / space) * 100).toFixed(2),
    }));
  });

  readonly revealDelay = computed(() => this.config()?.revealDelay ?? 2);

  ngOnInit(): void {
    this.api.config().subscribe((config) => this.config.set(config));
    this.api.activity().subscribe(({ opens }) => this.recent.set(opens));
  }

  orbLabel(orbType: number): string {
    return ORB_LABELS[orbType as OrbType] ?? "Orb";
  }

  rarityName(rank: number): string {
    return rarityOf(rank).name;
  }
}
