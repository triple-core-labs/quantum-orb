import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TwitterDialogComponent } from '../twitter-dialog/twitter-dialog.component';
import { CommonModule } from '@angular/common';
import { openDailyOrb } from '../../contract';
import { Select, Store } from '@ngxs/store';
import { CountdownEvent, CountdownModule } from 'ngx-countdown';
import { AppSelectors } from '../../store/app/app.selectors';
import { Observable } from 'rxjs';
import { OpenGenesisOrb, OpenQuantumOrb } from '../../store/app/app.actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { add, differenceInSeconds } from 'date-fns';

@Component({
  selector: 'orb',
  templateUrl: './orb.component.html',
  styleUrl: './orb.component.scss',
  standalone: true,
  imports: [CommonModule, CountdownModule],
})
export class OrbComponent implements OnInit {
  @Select(AppSelectors.lastOpenedDailyDate)
  lastOpenedDailyDate$!: Observable<Date | null>;

  leftTimeInSeconds: number | undefined;
  isTimerDone: boolean = false;

  @Input()
  type: string | undefined;

  @Input()
  price: number = 0;

  constructor(
    public dialog: MatDialog,
    private store: Store,
    private destroyRef: DestroyRef,
    private cdRef: ChangeDetectorRef
  ) {}

  openOrb() {
    if (this.type == 'daily') openDailyOrb(this.store);
    else if (this.type == 'twitter/x')
      this.dialog.open(TwitterDialogComponent, {
        autoFocus: false,
        panelClass: 'twitter-dialog',
      });
    else if (this.type == 'genesis') this.store.dispatch(new OpenGenesisOrb());
    else if (this.type == 'quantum') this.store.dispatch(new OpenQuantumOrb());
  }

  timerDone(e: CountdownEvent) {
    if (e.action !== 'done') return;
    this.isTimerDone = true;
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.lastOpenedDailyDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((date) => {
        if (!date) return;
        let timerEnd = add(date, { days: 1 });
        this.leftTimeInSeconds = differenceInSeconds(timerEnd, new Date());
      });
  }
}
