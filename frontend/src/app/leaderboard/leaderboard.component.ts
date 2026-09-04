import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Store } from "@ngxs/store";
import { toSignal } from "@angular/core/rxjs-interop";
import { AppSelectors } from "../store/app/app.selectors";
import { LoadLeaderboard } from "../store/app/app.actions";
import { ShortAddressPipe } from "../pipes/short-address.pipe";
import { ActivityFeedComponent } from "../activity/activity-feed.component";
import { ApiService } from "../api/api.service";
import { ReferrerRow } from "../api/api.types";

@Component({
  selector: "app-leaderboard",
  standalone: true,
  imports: [ShortAddressPipe, ActivityFeedComponent],
  templateUrl: "./leaderboard.component.html",
  styleUrl: "./leaderboard.component.scss",
})
export class LeaderboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly api = inject(ApiService);

  readonly referrers = signal<ReferrerRow[]>([]);

  readonly top = toSignal(this.store.select(AppSelectors.leaderboard), {
    initialValue: [],
  });
  readonly around = toSignal(this.store.select(AppSelectors.around), {
    initialValue: [],
  });
  readonly address = toSignal(this.store.select(AppSelectors.address), {
    initialValue: null,
  });

  readonly isEmpty = computed(() => this.top().length === 0);

  ngOnInit(): void {
    this.store.dispatch(new LoadLeaderboard());
    this.api.referrers().subscribe(({ referrers }) =>
      this.referrers.set(referrers),
    );
  }

  isYou(rowAddress: string): boolean {
    return rowAddress.toLowerCase() === this.address()?.toLowerCase();
  }
}
