import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { formatEther } from "ethers";
import { StepCardComponent } from "./step-card/step-card.component";
import { ActivityFeedComponent } from "../activity/activity-feed.component";
import { ApiService } from "../api/api.service";

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

  ngOnInit(): void {
    this.api.config().subscribe((config) => {
      if (!config.orbs) return;
      const next: Record<number, bigint> = {};
      for (const [key, value] of Object.entries(config.orbs)) {
        next[Number(key)] = BigInt(value.price);
      }
      this.prices.set(next);
    });
  }

  price(orbType: number): string {
    const wei = this.prices()[orbType];
    return wei === undefined ? "—" : formatEther(wei) + " ETH";
  }
}
