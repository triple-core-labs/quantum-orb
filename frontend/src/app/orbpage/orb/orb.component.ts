import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TwitterDialogComponent } from '../twitter-dialog/twitter-dialog.component';
import { CommonModule } from '@angular/common';

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

  constructor(public dialog: MatDialog) {}

  openTwitterDialog() {
    if (this.type !== 'twitter/x') return;
    this.dialog.open(TwitterDialogComponent, {
      autoFocus: false,
    });
  }
}
