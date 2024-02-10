import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Inject,
  Injector,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { User } from '../interfaces/user';
import { Store } from '@ngxs/store';
import { AppSelectors } from '../store/app/app.selectors';
import { map } from 'rxjs';

@Pipe({ name: 'invitationsAmount', standalone: true })
export class InvitationsAmountPipe implements PipeTransform {
  private asyncPipe: AsyncPipe;

  constructor(@Inject(ChangeDetectorRef) private cdr: ChangeDetectorRef, private store: Store) {
    this.asyncPipe = new AsyncPipe(cdr);
}

  transform(user: User) {
    return this.asyncPipe.transform(
      this.store
        .select(AppSelectors.users)
        .pipe(
          map(
            (users) =>
              users.filter(
                (filteredUser) => filteredUser.parent == user.address
              ).length
          )
        )
    );
  }

  ngOnDestroy(): void {
    this.asyncPipe.ngOnDestroy();
  }
}
