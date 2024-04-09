import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { Store } from "@ngxs/store";
import { toSignal } from "@angular/core/rxjs-interop";
import { AppSelectors } from "../store/app/app.selectors";
import { Connect } from "../store/app/app.actions";
import { WalletService } from "../wallet/wallet.service";
import { ShortAddressPipe } from "../pipes/short-address.pipe";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ShortAddressPipe],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent {
  private readonly store = inject(Store);
  private readonly wallet = inject(WalletService);

  readonly address = toSignal(this.store.select(AppSelectors.address), {
    initialValue: null,
  });

  readonly walletAvailable = this.wallet.available;

  readonly label = computed(() =>
    this.walletAvailable() ? "Connect wallet" : "No wallet found",
  );

  connect(): void {
    if (!this.walletAvailable()) return;
    this.store.dispatch(new Connect());
  }

  toggleMenu(event: Event): void {
    (event.currentTarget as HTMLElement)
      .closest("app-navbar")
      ?.classList.toggle("active");
  }
}
