import { Component, OnInit, inject, signal } from "@angular/core";
import { ApiService } from "../api/api.service";
import { GlobalStats, OrbOpenRow } from "../api/api.types";
import { ORB_LABELS, OrbType, rarityOf } from "../contract/orb-type";
import { ShortAddressPipe } from "../pipes/short-address.pipe";

@Component({
  selector: "app-activity-feed",
  standalone: true,
  imports: [ShortAddressPipe],
  templateUrl: "./activity-feed.component.html",
  styleUrl: "./activity-feed.component.scss",
})
export class ActivityFeedComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly opens = signal<OrbOpenRow[]>([]);
  readonly stats = signal<GlobalStats | null>(null);

  ngOnInit(): void {
    this.api.activity().subscribe(({ opens }) => this.opens.set(opens));
    this.api.stats().subscribe((stats) => this.stats.set(stats));
  }

  orbLabel(orbType: number): string {
    return ORB_LABELS[orbType as OrbType] ?? "Orb";
  }

  raritySlug(rank: number): string {
    return rarityOf(rank).slug;
  }

  rarityName(rank: number): string {
    return rarityOf(rank).name;
  }
}
