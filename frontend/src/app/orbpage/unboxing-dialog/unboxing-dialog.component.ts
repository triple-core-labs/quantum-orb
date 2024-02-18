import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { GetLastOpenedDaily, GetPoints } from '../../store/app/app.actions';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-unboxing-dialog',
  templateUrl: './unboxing-dialog.component.html',
  styleUrl: './unboxing-dialog.component.scss',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatProgressSpinnerModule],
})
export class UnboxingDialogComponent {
  pointsWon: number | undefined;
  isOrbOpened: boolean = false;
  constructor(
    private store: Store,
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {
    this.openOrb();
  }

  async openOrb() {
    if (!this.data) return;
    return this.data.wait().then((response: any) => {
      this.isOrbOpened = true;
      this.pointsWon = parseInt(response.events[1].data, 16);
      this.store.dispatch(new GetPoints());
      this.store.dispatch(new GetLastOpenedDaily());
    });
  }
}
