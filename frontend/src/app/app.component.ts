import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { AppSelectors } from './store/app/app.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @Select(AppSelectors.points)
  points$!: Observable<number>;
}
