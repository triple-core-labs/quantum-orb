import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TwitterDialogComponent } from '../twitter-dialog/twitter-dialog.component';

@Component({
  selector: 'orb',
  templateUrl: './orb.component.html',
  styleUrl: './orb.component.scss',
})
export class OrbComponent {
  @Input()
  type: string | undefined;

  @Input()
  price: number = 0;

  constructor(public dialog: MatDialog) {}

  openTwitterDialog() {
    if (this.type !== 'twitter/x') return;
    this.dialog.open(TwitterDialogComponent, {
      autoFocus: false,
    });
  }
}
