import { Component, Input } from '@angular/core';

@Component({
  selector: 'step-card',
  templateUrl: './step-card.component.html',
  styleUrl: './step-card.component.scss',
})
export class StepCardComponent {
  @Input()
  label: string | undefined;

  @Input()
  description: string | undefined;

  @Input()
  img: string | undefined;

  @Input()
  cardNumber: number | undefined;
}
