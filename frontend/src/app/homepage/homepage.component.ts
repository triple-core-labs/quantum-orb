import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { formatEther } from "ethers";
import { StepCardComponent } from "./step-card/step-card.component";
import { ActivityFeedComponent } from "../activity/activity-feed.component";
import { ApiService } from "../api/api.service";

interface PointRange {
  min: number;
  max: number;
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrl: "./homepage.component.scss",
  standalone: true,
  imports: [StepCardComponent, RouterLink, ActivityFeedComponent],
})
export class HomepageComponent implements OnInit {
  private readonly api = inject(ApiService);

  private readonly prices = signal<Record<number, bigint>>({});
  private readonly ranges = signal<Record<number, PointRange>>({});

  ngOnInit(): void {
    this.api.config().subscribe((config) => {
      if (config.orbs) {
        const prices: Record<number, bigint> = {};
        for (const [key, value] of Object.entries(config.orbs)) {
          prices[Number(key)] = BigInt(value.price);
        }
        this.prices.set(prices);
      }

      if (config.pointRanges) {
        const ranges: Record<number, PointRange> = {};
        for (const [key, band] of Object.entries(config.pointRanges)) {
          ranges[Number(key)] = {
            min: Math.min(...band.min),
            max: Math.max(...band.max),
          };
        }
        this.ranges.set(ranges);
      }
    });
  }

  price(orbType: number): string {
    const wei = this.prices()[orbType];
    return wei === undefined ? "—" : formatEther(wei) + " ETH";
  }

  pointRange(orbType: number): string {
    const range = this.ranges()[orbType];
    if (!range) return "";
    return `${range.min.toLocaleString("en-US")} – ${range.max.toLocaleString("en-US")} points`;
  }
}
