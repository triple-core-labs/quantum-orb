import { Component, OnInit, computed, inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { toSignal } from "@angular/core/rxjs-interop";
import { AppSelectors } from "../store/app/app.selectors";
import { LoadLeaderboard } from "../store/app/app.actions";
import { ShortAddressPipe } from "../pipes/short-address.pipe";

@Component({
  selector: "app-leaderboard",
  standalone: true,
  imports: [ShortAddressPipe],
  templateUrl: "./leaderboard.component.html",
  styleUrl: "./leaderboard.component.scss",
})
export class LeaderboardComponent implements OnInit {
  private readonly store = inject(Store);

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
  }

  isYou(rowAddress: string): boolean {
    return rowAddress.toLowerCase() === this.address()?.toLowerCase();
  }
}
