import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Store } from "@ngxs/store";
import { toSignal } from "@angular/core/rxjs-interop";
import { AppSelectors } from "../store/app/app.selectors";
import { LoadReferrals } from "../store/app/app.actions";
import { ReferralLinkService } from "./referral-link.service";
import { ShortAddressPipe } from "../pipes/short-address.pipe";

@Component({
  selector: "app-referrals",
  standalone: true,
  imports: [ShortAddressPipe],
  templateUrl: "./referrals.component.html",
  styleUrl: "./referrals.component.scss",
})
export class ReferralsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly links = inject(ReferralLinkService);

  readonly referrals = toSignal(this.store.select(AppSelectors.referrals), {
    initialValue: [],
  });
  readonly address = toSignal(this.store.select(AppSelectors.address), {
    initialValue: null,
  });
  readonly copied = signal(false);

  readonly inviteLink = computed(() => {
    const address = this.address();
    return address ? this.links.linkFor(address) : "";
  });

  readonly totalEarned = computed(() =>
    this.referrals().reduce((sum, row) => sum + row.earned, 0),
  );

  ngOnInit(): void {
    this.store.dispatch(new LoadReferrals());
  }

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.inviteLink());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
