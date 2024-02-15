import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TwitterDialogComponent } from '../twitter-dialog/twitter-dialog.component';
import { CommonModule } from '@angular/common';
import { openDailyOrb, openGenesisOrb, openQuantumOrb } from '../../contract';
import { Store } from '@ngxs/store';

@Component({
  selector: 'orb',
  templateUrl: './orb.component.html',
  styleUrl: './orb.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class OrbComponent {
  @Input()
  type: string | undefined;

  @Input()
  price: number = 0;

  constructor(public dialog: MatDialog, private store: Store) {}

  openOrb() {
    if (this.type == 'daily') openDailyOrb(this.store);
    else if (this.type == 'twitter/x')
      this.dialog.open(TwitterDialogComponent, {
        autoFocus: false,
      });
    else if (this.type == 'genesis') openGenesisOrb(this.store);
    else if (this.type == 'quantum') openQuantumOrb(this.store);
  }
}
