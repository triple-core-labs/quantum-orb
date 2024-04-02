import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { Store } from "@ngxs/store";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { ReferralLinkService } from "./referrals/referral-link.service";
import { WalletService } from "./wallet/wallet.service";
import { RestoreSession } from "./store/app/app.actions";
import { AppSelectors } from "./store/app/app.selectors";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly referralLink = inject(ReferralLinkService);
  private readonly wallet = inject(WalletService);
  private readonly store = inject(Store);

  readonly points = toSignal(this.store.select(AppSelectors.points), {
    initialValue: 0,
  });

  async ngOnInit(): Promise<void> {
    this.referralLink.capture(this.route.snapshot.queryParams);

    await this.wallet.restore();
    const address = this.wallet.address();
    if (address) this.store.dispatch(new RestoreSession(address));
  }
}
