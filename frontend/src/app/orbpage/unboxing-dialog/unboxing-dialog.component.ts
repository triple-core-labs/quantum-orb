import { Component, computed, inject } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { Store } from "@ngxs/store";
import { toSignal } from "@angular/core/rxjs-interop";
import { AppSelectors } from "../../store/app/app.selectors";
import { DismissOutcome, ReclaimOrb } from "../../store/app/app.actions";
import { ORB_LABELS, OrbType, rarityOf } from "../../contract/orb-type";
import { OrbStatus } from "../../store/orb/orb-status";

@Component({
  selector: "app-unboxing-dialog",
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: "./unboxing-dialog.component.html",
  styleUrl: "./unboxing-dialog.component.scss",
})
export class UnboxingDialogComponent {
  private readonly store = inject(Store);

  readonly status = toSignal(this.store.select(AppSelectors.orbStatus), {
    initialValue: { kind: "idle" } as OrbStatus,
  });

  readonly orbLabel = computed(() => {
    const status = this.status();
    return "orbType" in status ? ORB_LABELS[status.orbType as OrbType] : "";
  });

  readonly rank = computed(() => {
    const status = this.status();
    return status.kind === "revealed" ? status.rank : 0;
  });

  readonly rarity = computed(() => rarityOf(this.rank()));

  readonly points = computed(() => {
    const status = this.status();
    return status.kind === "revealed" ? status.points : 0;
  });

  readonly message = computed(() => {
    const status = this.status();
    return status.kind === "error" ? status.message : "";
  });

  reclaim(): void {
    this.store.dispatch(new ReclaimOrb());
  }

  dismiss(): void {
    this.store.dispatch(new DismissOutcome());
  }
}
