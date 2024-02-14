import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-twitter-dialog',
  templateUrl: './twitter-dialog.component.html',
  styleUrl: './twitter-dialog.component.scss',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatInputModule],
})
export class TwitterDialogComponent {
  twitterTag: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
  });
}
