import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-twitter-dialog',
  templateUrl: './twitter-dialog.component.html',
  styleUrl: './twitter-dialog.component.scss',
})
export class TwitterDialogComponent {
  twitterTag: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
  });
}
