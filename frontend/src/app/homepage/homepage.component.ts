import { Component } from '@angular/core';

interface Question {
  question: string;
  answer: string;
  active: boolean;
}

@Component({
  selector: 'homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  questions: Question[] = [
    {
      question: 'nisi vitae suscipit tellus mauris a diam maecenas sed enim',
      answer: 'nisi vitae suscipit tellus mauris a diam maecenas sed enim',
      active: false,
    },
    {
      question: 'nisi vitae suscipit tellus mauris a diam maecenas sed enim',
      answer: 'nisi vitae suscipit tellus mauris a diam maecenas sed enim',
      active: false,
    },
    {
      question: 'nisi vitae suscipit tellus mauris a diam maecenas sed enim',
      answer: 'nisi vitae suscipit tellus mauris a diam maecenas sed enim',
      active: false,
    },
    {
      question: 'nisi vitae suscipit tellus mauris a diam maecenas sed enim',
      answer: 'nisi vitae suscipit tellus mauris a diam maecenas sed enim',
      active: false,
    },
  ];
}
