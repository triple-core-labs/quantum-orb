import {
  Component,
  HostBinding,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
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
  readonly menuOpen = signal(false);

  readonly label = computed(() =>
    this.walletAvailable() ? "CONNECT WALLET" : "NO WALLET FOUND",
  );

  @HostBinding("class.active")
  get isMenuOpen(): boolean {
    return this.menuOpen();
  }

  constructor() {
    effect(() => {
      document.body.classList.toggle("menu-open", this.menuOpen());
    });
  }

  @HostListener("document:keydown.escape")
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  connect(): void {
    if (!this.walletAvailable()) return;
    this.closeMenu();
    this.store.dispatch(new Connect());
  }
}
